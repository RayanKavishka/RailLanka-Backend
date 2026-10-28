import mongoose from "mongoose";

interface IRouteRequest {
    routeId: string;
    routeName: string;
    routeCode: string;
    description?: string;
    estimatedDurationHours: number;

    stations: {
        stationId: mongoose.Types.ObjectId,
        arrivalTime: string,
        departureTime: string
    }[];
}



export default IRouteRequest;