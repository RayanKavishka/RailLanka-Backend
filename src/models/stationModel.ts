import { model, Schema } from "mongoose";
import IStation from "../interfaces/IStation";

const stationSchema = new Schema<IStation>(
    {
        stationName: {
            type: String,
            required: [true, "Station name is required."],
            trim: true,
            minlength: [2, "Station name must be at least 2 characters."],
            maxlength: [100, "Station name cannot exceed 100 characters."]
        },

        stationCode: {
            type: String,
            required: [true, "Station code is required."],
            unique: true,
            trim: true,
            uppercase: true,
            minlength: [2, "Station code must be at least 2 characters."],
            maxlength: [10, "Station code cannot exceed 10 characters."],
            match: [
                /^[A-Z0-9]+$/,
                "Station code can only contain letters and numbers."
            ]
        },

        location: {
            latitude: {
                type: Number,
                required: [true, "Station latitude is required."],
                min: [-90, "Latitude cannot be less than -90."],
                max: [90, "Latitude cannot exceed 90."]
            },

            longitude: {
                type: Number,
                required: [true, "Station longitude is required."],
                min: [-180, "Longitude cannot be less than -180."],
                max: [180, "Longitude cannot exceed 180."]
            }
        },

        address: {
            type: String,
            required: [true, "Station address is required."],
            trim: true,
            minlength: [3, "Station address must be at least 3 characters."],
            maxlength: [200, "Station address cannot exceed 200 characters."]
        },

        isActive: {
            type: Boolean,
            required: true,
            default: true
        }
    },

    {
        timestamps: true
    }
);

const StationModel = model<IStation>("Station", stationSchema);

export default StationModel;