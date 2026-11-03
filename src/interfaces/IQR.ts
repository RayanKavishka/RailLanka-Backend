import { Document, Types } from "mongoose";
import { QRStatus } from "../models/qrModel";

interface IQR extends Document {
    ticket: Types.ObjectId;
    passenger: Types.ObjectId;
    qrToken: string;
    status: QRStatus;
    expiresAt: Date;
}

export default IQR;