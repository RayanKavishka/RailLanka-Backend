import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import QRModel from "../models/qrModel";

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