import { model, Schema } from "mongoose";
import IPayment from "../interfaces/IPayment";


export enum PayMethod {
    PAYHERE = "PAYHERE"
}

export enum PayStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}

const paymentSchema = new Schema<IPayment>(
    {
        ticket: {
            type: Schema.Types.ObjectId,
            ref: "Ticket",
            required: [true, "Ticket is required."]
        },

        paymentMethod: {
            type: String,
            required: [true, "Payment method is required."],
            enum: Object.values(PayMethod)
        },

        amount: {
            type: Number,
            required: [true, "Payment amount is required."],
            min: [0.01, "Payment amount must be greater than zero."]
        },

        paymentStatus: {
            type: String,
            required: [true, "Payment status is required."],
            enum: Object.values(PayStatus),
            default: PayStatus.PENDING
        }
    },

    {
        timestamps: true
    }
);


const PaymentModel = model<IPayment>("Payment", paymentSchema);

export default PaymentModel;