import { model, Schema } from "mongoose";
import IQR from "../interfaces/IQR";


export enum QRStatus {
    ACTIVE = "ACTIVE",
    USED = "USED",
    EXPIRED = "EXPIRED"
}

const qrSchema = new Schema<IQR>(
    {
        ticket: {
            type: Schema.Types.ObjectId,
            ref: "Ticket",
            required: [true, "Ticket is required."],
            unique: true
        },

        passenger: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Passenger is required."]
        },

        qrToken: {
            type: String,
            required: [true, "QR token is required."],
            unique: true,
            trim: true
        },

        status: {
            type: String,
            required: [true, "QR status is required."],
            enum: Object.values(QRStatus),
            default: QRStatus.ACTIVE
        },

        expiresAt: {
            type: Date,
            required: [true, "QR expiration date is required."]
        }
    },

    {
        timestamps: true
    }
);


const QRModel = model<IQR>("QR", qrSchema);

export default QRModel;