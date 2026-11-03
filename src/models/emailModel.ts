import { model, Schema } from "mongoose";
import IEmail from "../interfaces/IEmail";

export enum EmailStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    FAILED = "FAILED"
}

const emailSchema = new Schema<IEmail>(
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

        qr: {
            type: Schema.Types.ObjectId,
            ref: "QR",
            required: [true, "QR is required."]
        },

        recipient: {
            type: String,
            required: [true, "Recipient email is required."],
            trim: true
        },

        subject: {
            type: String,
            required: [true, "Email subject is required."]
        },

        emailStatus: {
            type: String,
            required: true,
            enum: Object.values(EmailStatus),
            default: EmailStatus.PENDING
        },

        sentAt: {
            type: Date
        },

        errorMessage: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const EmailModel = model<IEmail>("Email", emailSchema);

export default EmailModel;