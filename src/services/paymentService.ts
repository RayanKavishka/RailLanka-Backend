import mongoose from "mongoose";
import PaymentModel, {PayMethod, PayStatus} from "../models/paymentModel";
import TicketModel from "../models/ticketModel";
import UserModel from "../models/userModel";
import QRModel from "../models/qrModel";
import AppError from "../errors/AppError";
import { verifyPayHereNotification } from "./payhereService";
import { createTicketQR } from "./qrService";
import { sendTicketConfirmationEmail } from "./emailService";
import JourneyModel from "../models/journeyModel";
import IPaymentsResponse, { PaymentDetails } from "../interfaces/response/IPaymentsResponse";
import PopulatedPayment from "../interfaces/PopulatedPayment";
import getJourneyName from "../utils/getJourneyName";

interface IPayHereNotification {
    merchant_id: string;
    order_id: string;
    payhere_amount: string;
    payhere_currency: string;
    status_code: string;
    md5sig: string;
}

export const handlePaymentNotification = async (
    notification: IPayHereNotification
) => {
    console.log("Executes handlePaymentNotification()");

    const isValid = verifyPayHereNotification({
        merchantId: notification.merchant_id,
        orderId: notification.order_id,
        amount: notification.payhere_amount,
        currency: notification.payhere_currency,
        statusCode: notification.status_code,
        receivedHash: notification.md5sig
    });

    if (!isValid) {
        throw new AppError(400, "Invalid PayHere notification.");
    }

    const paymentId = notification.order_id;
    const session = await mongoose.startSession();

    try {
        const outcome = await session.withTransaction(async () => {
            const existingPayment = await PaymentModel.findById(
                paymentId
            ).session(session);

            if (!existingPayment) {
                throw new AppError(404, "Payment not found.");
            }

            if (
                existingPayment.amount.toFixed(2) !==
                Number(notification.payhere_amount).toFixed(2)
            ) {
                throw new AppError(400, "Payment amount mismatch.");
            }

            if (notification.payhere_currency !== "LKR") {
                throw new AppError(400, "Payment currency mismatch.");
            }

            if (notification.status_code === "0") {
                return "IGNORE";
            }

            if (
                notification.status_code === "-1" ||
                notification.status_code === "-2" ||
                notification.status_code === "-3"
            ) {
                if (existingPayment.paymentStatus === PayStatus.PENDING) {
                    existingPayment.paymentStatus = PayStatus.CANCELLED;
                    await existingPayment.save({ session });
                }

                return "IGNORE";
            }

            if (notification.status_code !== "2") {
                throw new AppError(400, "Invalid payment status code.");
            }

            if (existingPayment.paymentStatus === PayStatus.PENDING) {
                existingPayment.paymentStatus = PayStatus.PAID;
                await existingPayment.save({ session });
            }

            if (existingPayment.paymentStatus !== PayStatus.PAID) {
                return "IGNORE";
            }

            return "CONFIRM";
        });

        if (outcome !== "CONFIRM") {
            return;
        }

        const payment = await PaymentModel.findOneAndUpdate(
            {
                _id: paymentId,
                paymentStatus: PayStatus.PAID,
                confirmationSentAt: null
            },
            { $set: { confirmationSentAt: new Date() } },
            { returnDocument: "after" }
        );

        if (!payment) {
            console.log("Payment already confirmed, skipping:", paymentId);
            return;
        }

        try {
            const ticket = await TicketModel.findById(payment.ticket);

            if (!ticket) {
                throw new AppError(404, "Ticket not found.");
            }

            const passenger = await UserModel.findById(ticket.passenger);

            if (!passenger) {
                throw new AppError(404, "Passenger not found.");
            }

            const existingQR = await QRModel.findOne({
                ticket: ticket._id
            });

            let expiresAt = existingQR?.expiresAt;

            if (!expiresAt) {
                const journey = await JourneyModel.findById(ticket.journey);

                if (!journey) {
                    throw new AppError(404, "Related journey not found.");
                }

                expiresAt = journey.journeyDate;
            }

            const qr = await createTicketQR({
                ticketId: ticket._id.toString(),
                passengerId: passenger._id.toString(),
                expiresAt
            });

            await sendTicketConfirmationEmail({
                recipient: passenger.email,
                passengerId: passenger._id.toString(),
                passengerName: passenger.fullName,
                ticketId: ticket._id.toString(),
                totalPrice: payment.amount,
                qrImage: qr.qrImage
            });
        } catch (confirmError) {

            await PaymentModel.updateOne(
                { _id: paymentId },
                { $set: { confirmationSentAt: null } }
            );
            throw confirmError;
        }
    } catch (error) {
        console.error("Error in handlePaymentNotification()", error);
        throw error;
    } finally {
        await session.endSession();
    }
};

export const getAllPayments = async (page: number, size: number): Promise<IPaymentsResponse> => {
    console.log("Executes getAllPayments()");
    try {
        const offset: number = (page - 1) * size;

        const allPaymentsForPage: PopulatedPayment[] = await PaymentModel
            .find()
            .populate({
                path: "ticket",
                populate: [
                    {
                        path: "passenger"
                    },
                    {
                        path: "journey",
                        populate: {
                            path: "route"
                        }
                    }
                ]
            })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(size)
            .lean<PopulatedPayment[]>();

        const totalPayments = await PaymentModel.countDocuments();
        const totalPages = Math.ceil(totalPayments / size);

        const payments: PaymentDetails[] = await Promise.all(

            allPaymentsForPage.map(async (paymentDetail: PopulatedPayment) => {
                const journeyN = await getJourneyName(
                    paymentDetail.ticket.journey.startStation,
                    paymentDetail.ticket.journey.destinationStation
                );

                return {
                    journey: journeyN,
                    passengerEmail: paymentDetail.ticket.passenger.email,
                    amount: paymentDetail.amount,
                    payMethod: paymentDetail.paymentMethod,
                    paymentDate: paymentDetail.createdAt,
                    paymentStatus: paymentDetail.paymentStatus
                }
            })
        )

        return {
            payments: payments,
            pagination: {
                currentPage: page,
                pageSize: size,
                totalPayments: totalPayments,
                totalPages: totalPages
            }
        }

    } catch (error) {
        console.error("Error in getAllPayments()", error);
        throw error;
    }
}