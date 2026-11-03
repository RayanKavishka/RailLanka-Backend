import { Types } from "mongoose";

interface IEmail {
    ticket: Types.ObjectId;
    passenger: Types.ObjectId;
    qr: Types.ObjectId;
    recipient: string;
    subject: string;
    emailStatus: "PENDING" | "SENT" | "FAILED";
    sentAt?: Date;
    errorMessage?: string;
}

export default IEmail;