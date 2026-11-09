import {PayMethod, PayStatus} from "../../models/paymentModel";


export interface PaymentDetails {
    journey: string;
    passengerEmail: string;
    amount: number;
    payMethod: PayMethod;
    paymentDate: Date;
    paymentStatus: PayStatus;
}

export interface PaymentPagination {
    currentPage: number;
    pageSize: number;
    totalPayments: number;
    totalPages: number;
}

interface IPaymentsResponse {
    payments: PaymentDetails[];
    pagination: PaymentPagination;
}


export default IPaymentsResponse;