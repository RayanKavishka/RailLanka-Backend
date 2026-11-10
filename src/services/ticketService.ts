import TicketModel from "../models/ticketModel";
import ITicket from "../interfaces/ITicket";
import AppError from "../errors/AppError";
import PaymentModel, {PayStatus} from "../models/paymentModel";
import QRModel, {QRStatus} from "../models/qrModel";
import QRCode from "qrcode";
import {ITicketResponse} from "../interfaces/response/ITicketResponse";
import IJourney from "../interfaces/IJourney";
import getJourneyName from "../utils/getJourneyName";
import mongoose from "mongoose";


export type PopulatedTicket = Omit<ITicket, "journey"> & {
     journey: IJourney
}

export const geAllTicketsByPassengerId = async (passengerId: string): Promise<ITicketResponse[]> => {
    console.log("Executes geAllTicketsByPassengerId()");
    const session = await mongoose.startSession();
    try {
        const result: ITicketResponse[] = await session.withTransaction(async () => {
            const tickets: PopulatedTicket[] = await TicketModel.find({
                passenger: passengerId,
            })
            .populate<{ journey: IJourney }>({
                path: "journey"
            })
            .sort({ createdAt: -1 })
            .lean<PopulatedTicket[]>();

            if (tickets.length === 0) {
                throw new AppError(404, "No tickets found for this passenger.");
            }

            return Promise.all(
                tickets.map(async (ticket): Promise<ITicketResponse> => {

                    const [payment, qr] = await Promise.all([
                        PaymentModel.findOne({ ticket: ticket._id }),
                        QRModel.findOne({ ticket: ticket._id })
                    ]);

                    let qrImage = "";
                    let qrExpiresAt = new Date(0);

                    let qrStatus = QRStatus.EXPIRED;

                    if (qr) {
                        if (qr.expiresAt < new Date()) {
                            await QRModel.updateOne(
                                { _id: qr._id },
                                { $set: { qrStatus: QRStatus.EXPIRED } }
                            );

                            qrStatus = QRStatus.EXPIRED;

                        } else {
                            qrStatus = qr.status;
                        }
                    }

                    if (qrExpiresAt)

                        if (payment?.paymentStatus === PayStatus.PAID && qr?.qrToken) {
                            qrImage = await QRCode.toDataURL(qr.qrToken);
                        }

                    const journeyN = await getJourneyName(ticket.journey.startStation, ticket.journey.destinationStation);

                    return {
                        passengerId,
                        journeyName: journeyN,
                        amount: payment?.amount ?? 0,
                        qrImage,
                        qrStatus,
                        qrExpiresAt
                    };
                })
            );
        });

        return result;

    } catch (error) {
        console.error("Error in geAllTicketsByPassengerId()", error);
        throw error;

    } finally {
        await session.endSession();
    }
}