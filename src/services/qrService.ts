import {randomBytes} from "node:crypto";
import QRCode from "qrcode";
import QRModel, {QRStatus} from "../models/qrModel";
import mongoose from "mongoose";
import AppError from "../errors/AppError";
import PaymentModel, {PayStatus} from "../models/paymentModel";
import TicketModel from "../models/ticketModel";
import UserModel from "../models/userModel";

interface CreateTicketQR {
    ticketId: string;
    passengerId: string;
    expiresAt: Date;
}

export const createTicketQR = async ({
    ticketId,
    passengerId,
    expiresAt
}: CreateTicketQR) => {

    let qr = await QRModel.findOne({ ticket: ticketId });

    if (!qr) {
        const qrToken = randomBytes(32).toString("hex");

        try {
            qr = await QRModel.create({
                ticket: ticketId,
                passenger: passengerId,
                qrToken,
                expiresAt
            });

        } catch (error: any) {
            if (error.code !== 11000) {
                throw error;
            }

            qr = await QRModel.findOne({ ticket: ticketId });

            if (!qr) {
                throw error;
            }
        }
    }

    const qrImage = await QRCode.toBuffer(qr.qrToken, {
        type: "png",
        width: 300,
        margin: 2
    });

    return {
        qr,
        qrImage
    };
};

export const getPaymentTicket = async (paymentId: string, userId: string) => {
    if (!mongoose.isValidObjectId(paymentId)) {
        throw new AppError(404, "Payment not found.");
    }

    const payment = await PaymentModel.findById(paymentId);
    if (!payment) throw new AppError(404, "Payment not found.");

    const ticket = await TicketModel.findById(payment.ticket);
    if (!ticket) throw new AppError(404, "Ticket not found.");

    if (ticket.passenger.toString() !== userId) {
        throw new AppError(403, "You are not allowed to view this ticket.");
    }

    const passenger = await UserModel.findById(ticket.passenger);
    if (!passenger) throw new AppError(404, "Passenger not found.");

    let qrImage: string | undefined;
    let qrStatus: string | undefined;

    if (payment.paymentStatus === PayStatus.PAID) {
        const qr = await QRModel.findOne({ ticket: ticket._id });
        if (qr) {
            qrImage = await QRCode.toDataURL(qr.qrToken);
            qrStatus = qr.status;
        }
    }

    return {
        ticketId: ticket._id.toString(),
        paymentStatus: payment.paymentStatus,
        amount: payment.amount,
        passengerName: passenger.fullName,
        passengerEmail: passenger.email,
        qrImage,
        qrStatus
    };
}

export const verifyQR = async (qrToken: string): Promise<string> => {
    console.log("Executes verifyQR()");
    try {
        const now = new Date();

        const updatedQR = await QRModel.findOneAndUpdate(
            {
                qrToken,
                status: QRStatus.ACTIVE,
                expiresAt: { $gt: now }
            },
            {
                $set: { status: QRStatus.USED }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (updatedQR) {
            return "Ticket is verified.";
        }

        const existingQR = await QRModel.findOne({ qrToken });

        if (!existingQR) {
            throw new AppError(404, "Invalid QR code.");
        }

        if (existingQR.status === QRStatus.USED) {
            return "Ticket has already been used.";
        }

        if (existingQR.status === QRStatus.EXPIRED ||
            existingQR.expiresAt <= now) {

            await QRModel.updateOne(
                {
                    _id: existingQR._id,
                    status: QRStatus.ACTIVE,
                    expiresAt: { $lte: now }
                },
                {
                    $set: { status: QRStatus.EXPIRED }
                }
            );

            return "Ticket has expired.";
        }

        return "Ticket is not active.";

    } catch (error) {
        console.error("Error in verifyQR()", error);
        throw error;
    }
}