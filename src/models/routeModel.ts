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

        description: {
            type: String,
            trim: true,
            maxlength: [500, "Route description cannot exceed 500 characters."]
        },

        estimatedDurationHours: {
            type: Number,
            required: [true, "Estimated route duration is required."],
            min: [0.01, "Estimated route duration must be greater than zero."]
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

const RouteModel = model<IRoute>("Route", routeSchema);

export default RouteModel;