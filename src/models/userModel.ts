
import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    roles: UserRoles[];
    isActive: boolean;
}

export enum UserRoles {
    ADMIN = "ADMIN",
    PASSENGER = "PASSENGER",
    TICKET_INSPECTOR = "TICKET_INSPECTOR"
}

const userSchema = new Schema<IUser>(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required."],
            trim: true,
            minlength: [3, "Full name must be at least 3 characters."],
            maxlength: [100, "Full name cannot exceed 100 characters."]
        },

        email: {
            type: String,
            required: [true, "Email is required."],
            unique: true,
            trim: true,
            maxlength: [254, "Email cannot exceed 254 characters."],
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address."
            ]
        },

        password: {
            type: String,
            required: [true, "Password is required."],
            minlength: [8, "Password must be at least 8 characters."],
            maxlength: [128, "Password cannot exceed 128 characters."],
        },

        phone: {
            type: String,
            required: [true, "Phone number is required."],
            unique: true,
            trim: true,
            match: [
                /^(?:\+94|0)7[0-9]{8}$/,
                "Please enter a valid Sri Lankan mobile number."
            ]
        },

        roles: {
            type: [String],
            required: true,
            enum: Object.values(UserRoles),
            default: [UserRoles.PASSENGER]
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

const UserModel = model<IUser>("User", userSchema);

export default UserModel;