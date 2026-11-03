import mongoose from "mongoose";
import PaymentModel, { PayStatus } from "../models/paymentModel";
import TicketModel from "../models/ticketModel";
import UserModel from "../models/userModel";
import QRModel from "../models/qrModel";
import AppError from "../errors/AppError";
import { verifyPayHereNotification } from "./payhereService";
import { createTicketQR } from "./qrService";
import { sendTicketConfirmationEmail } from "./emailService";
import JourneyModel from "../models/journeyModel";

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

        const payment = await PaymentModel.findById(paymentId);

        if (!payment || payment.paymentStatus !== PayStatus.PAID) {
            throw new AppError(404, "Confirmed payment not found.");
        }

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

    } catch (error) {
        console.error("Error in handlePaymentNotification()", error);
        throw error;

    } finally {
        await session.endSession();
    }
};