import mongoose from "mongoose";

interface IRouteStation {
    routeId: mongoose.Types.ObjectId,
    stations: {
        stationId: mongoose.Types.ObjectId,
        arrivalTime: string,
        departureTime: string
    }[];
}



export default IRouteStation;