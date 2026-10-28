import mongoose, { Document } from "mongoose";

interface IRoute extends Document {
    routeName: string;
    routeCode: string;
    description?: string;
    estimatedDurationHours: number;
}



export default IRoute;