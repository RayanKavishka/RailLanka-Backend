import { model, Schema } from "mongoose";
import ITicket from "../interfaces/ITicket";
import { TicketClass } from "./journeyModel"


const ticketSchema = new Schema<ITicket>(
    {
        journey: {
            type: Schema.Types.ObjectId,
            ref: "Journey",
            required: [true, "Journey is required."]
        },

        passenger: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Passenger is required."]
        },

        tickets: {
            type: [
                {
                    class: {
                        type: String,
                        required: [true, "Journey class is required."],
                        enum: Object.values(TicketClass),
                        default: TicketClass.THIRD_CLASS
                    },

                    ticketCount: {
                        type: Number,
                        required: [true, "Ticket count is required."],
                        min: [1, "Ticket count must be at least 1."],
                        validate: {
                            validator: Number.isInteger,
                            message: "Ticket count must be an whole number."
                        }
                    }
                }
            ],
            required: [true, "At least one journey class is required."],
            validate: {
                validator: (classes: unknown[]) => classes.length > 0,
                message: "Journey must have at least one class."
            }
        },

        totalPrice: {
            type: Number,
            required: [true, "Total ticket price is required."],
            min: [0, "Total ticket price cannot be negative."]
        }
    },

    {
        timestamps: true
    }
);


const TicketModel = model<ITicket>("Ticket", ticketSchema);

export default TicketModel;