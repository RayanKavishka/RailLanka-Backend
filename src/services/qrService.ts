import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import QRModel from "../models/qrModel";
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
};