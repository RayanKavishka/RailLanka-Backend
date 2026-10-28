import mongoose, { Document } from "mongoose";

interface IRoute extends Document {
    routeName: string;
    description?: string;
    estimatedDurationHours: number;
    isActive: boolean;
}



export default IRoute;