import { Document } from "mongoose";

interface IStation extends Document {
    stationName: string;
    stationCode: string;
    location: {
        latitude: number;
        longitude: number;
    },
    address: string;
    isActive: boolean;
}

export interface INestedStation {
    station: IStation | null;
    arrivalTime: string;
    departureTime: string;
}



export default IStation;