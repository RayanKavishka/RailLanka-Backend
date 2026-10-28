import mongoose from "mongoose";

interface IRouteStation {
    route: mongoose.Types.ObjectId,
    stations: {
        station: mongoose.Types.ObjectId,
        arrivalTime: string,
        departureTime: string
    }[];
    isActive: boolean;
}



export default IRouteStation;