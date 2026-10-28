import mongoose from "mongoose";

interface IRouteResponse {
    routeId: string;
    routeName: string;
    routeCode: string;
    description?: string;
    estimatedDurationHours: number;

    stations: {
        stationId: string,
        stationName: string;
        stationCode: string;
        location: {
            latitude: number;
            longitude: number;
        },
        address: string;

        arrivalTime: string,
        departureTime: string
    }[];
}



export default IRouteResponse;