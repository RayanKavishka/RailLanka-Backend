import {Document, Types} from "mongoose";


interface IJourney extends Document {
    route: Types.ObjectId;
    startStation: string;
    destinationStation: string;
    journeyDuration: number;
    journeyDate: Date;
    isActive: boolean;
}


export default IJourney;