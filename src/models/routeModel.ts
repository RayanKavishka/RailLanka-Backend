import { model, Schema } from "mongoose";
import IRoute from "../interfaces/IRoute";


const routeSchema = new Schema<IRoute>(
    {
        routeName: {
            type: String,
            required: [true, "Route name is required."],
            trim: true,
            minlength: [6, "Route name must be at least 6 characters."],
            maxlength: [100, "Route name cannot exceed 100 characters."]
        },

        routeCode: {
            type: String,
            required: [true, "Route code is required."],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: [2, "Route code must be at least 2 characters."],
            maxlength: [10, "Route code cannot exceed 10 characters."],
            match: [
                /^[A-Z0-9]+$/,
                "Route code can only contain letters and numbers."
            ]
        },

        description: {
            type: String,
            trim: true,
            maxlength: [500, "Route description cannot exceed 500 characters."]
        },

        estimatedDurationHours: {
            type: Number,
            required: [true, "Estimated route duration is required."],
            min: [0.01, "Estimated route duration must be greater than zero."]
        }
    },

    {
        timestamps: true
    }
);

const RouteModel = model<IRoute>("Route", routeSchema);

export default RouteModel;