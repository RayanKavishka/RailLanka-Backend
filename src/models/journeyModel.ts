import { model, Schema } from "mongoose";
import IJourney from "../interfaces/IJourney";


export enum TicketClass {
    FIRST_CLASS = "FIRST_CLASS",
    SECOND_CLASS = "SECOND_CLASS",
    THIRD_CLASS = "THIRD_CLASS"
}

const journeySchema = new Schema<IJourney>(
    {
        route: {
            type: Schema.Types.ObjectId,
            ref: "Route",
            required: [true, "Route is required."]
        },

        startStation: {
            type: String,
            required: [true, "Start station is required."],
            trim: true,
            minlength: [2, "Start station must be at least 2 characters."],
            maxlength: [100, "Start station cannot exceed 100 characters."]
        },

        destinationStation: {
            type: String,
            required: [true, "Destination station is required."],
            trim: true,
            minlength: [2, "Destination station must be at least 2 characters."],
            maxlength: [100, "Destination station cannot exceed 100 characters."]
        },

        journeyDuration: {
            type: Number,
            required: [true, "Journey duration is required."],
            min: [1, "Journey duration must be greater than 0."]
        },

        journeyDate: {
            type: Date,
            required: [true, "Departure date is required."]
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },

    {
        timestamps: true
    }
);


const JourneyModel = model<IJourney>("Journey", journeySchema);

export default JourneyModel;