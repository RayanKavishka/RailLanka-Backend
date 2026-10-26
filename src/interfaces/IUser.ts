import {UserRoles} from "../models/userModel";
import { Document } from "mongoose";

interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    roles: UserRoles[];
    isActive: boolean;
}


export default IUser;