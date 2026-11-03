import { Document, Types } from "mongoose";
import { TicketClass } from "../models/journeyModel";


export type Ticket = {
    class: TicketClass;
    ticketCount: number;
}

interface ITicket extends Document {
    journey: Types.ObjectId;
    passenger: Types.ObjectId,
    tickets: Ticket[]
    totalPrice: number;
}

export default ITicket;