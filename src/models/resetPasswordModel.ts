import {model, Schema} from "mongoose";


export interface IPasswordReset {
    email: string;
    otpHash: string;
    expiresAt: Date;
    attempts: number;
    verifiedAt: Date;
    resetTokenHash: string | null;
    resetTokenExpiresAt: Date | null;
}

const passwordResetSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required."],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address."
            ]
        },

        otpHash: {
            type: String,
            required: [true, "OTP hash is required."],
            trim: true
        },

        expiresAt: {
            type: Date,
            required: [true, "OTP expiration time is required."],
            validate: {
                validator: (value: Date) =>
                    value instanceof Date && !isNaN(value.getTime()),
                message: "Invalid OTP expiration date."
            }
        },

        attempts: {
            type: Number,
            default: 0,
            min: [0, "Attempts cannot be negative."],
            max: [5, "Maximum OTP attempts exceeded."],
            validate: {
                validator: Number.isInteger,
                message: "Attempts must be an integer."
            }
        },

        verifiedAt: {
            type: Date,
            default: null
        },

        resetTokenHash: {
            type: String,
            default: null,
            trim: true
        },

        resetTokenExpiresAt: {
            type: Date,
            default: null,
            validate: {
                validator: (value: Date | null) =>
                    value === null ||
                    (value instanceof Date && !isNaN(value.getTime())),
                message: "Invalid reset token expiration date."
            }
        }
    },
    {
        timestamps: true
    }
);

passwordResetSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const PasswordResetModel = model<IPasswordReset>("PasswordReset", passwordResetSchema);

export default PasswordResetModel;