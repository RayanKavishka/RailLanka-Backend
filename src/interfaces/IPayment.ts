import { Document, Types } from "mongoose";
import {PayMethod, PayStatus} from "../models/paymentModel";

interface IPayment extends Document {
    ticket: Types.ObjectId;
    paymentMethod: PayMethod;
    amount: number;
    paymentStatus: PayStatus;
}

export default IPayment;