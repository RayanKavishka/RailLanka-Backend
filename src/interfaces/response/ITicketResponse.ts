import {QRStatus} from "../../models/qrModel";

export interface ITicketResponse {
    passengerId: string;
    journeyName: string;
    amount: number;
    qrImage: string;
    qrStatus: QRStatus;
    qrExpiresAt: Date;
}