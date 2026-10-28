import {model, Schema} from "mongoose";
import IRouteStation from "../interfaces/IRouteStation";


const routeStationSchema = new Schema<IRouteStation>(
    {
        route: {
            type: Schema.Types.ObjectId,
            ref: "Route",
            required: [true, "Route is required."]
        },

        stations: {
            type: [
                {
                    station: {
                        type: Schema.Types.ObjectId,
                        ref: "Station",
                        required: [true, "Station is required."]
                    },

                    arrivalTime: {
                        type: String,
                        required: [true, "Station arrival time is required."],
                        match: [
                            /^([01]\d|2[0-3]):[0-5]\d$/,
                            "Arrival time must be in HH:mm format."
                        ]
                    },

                    departureTime: {
                        type: String,
                        required: [true, "Station departure time is required."],
                        match: [
                            /^([01]\d|2[0-3]):[0-5]\d$/,
                            "Departure time must be in HH:mm format."
                        ]
                    }
                }
            ],
            required: [true, "Route stations are required."],
            validate: {
                validator: (stations: unknown[]) => stations.length >= 2,
                message: "A route must contain at least two stations."
            }
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

const RouteStationModel = model<IRouteStation>("RouteStation", routeStationSchema);

export default RouteStationModel;