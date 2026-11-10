import * as authService from '../services/authService';
import { Request, Response, NextFunction } from "express";
import {signAccessToken, signRefreshToken} from "../utils/jwtUtil";
import AppError from "../errors/AppError";
import {AuthRequest} from "../middlewares/authenticate";
import {type} from "node:os";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    await authService.registerUser(req.body);
    res.status(201).json({
        message: "Operation success."
    });
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userDetails = await authService.login(req.body);

        const accessToken = signAccessToken(userDetails);
        const refreshToken = signRefreshToken(userDetails);

        if (!accessToken || !refreshToken) {
            throw new AppError(500, "Internal server error.");
        }

        res.status(200).json({
            message: "Operation success.",
            body: {
                email: userDetails.email,
                roles: userDetails.roles,
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getNewAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken }  = req.body;
    const accessToken = await authService.getNewAccessToken(refreshToken);

    res.status(200).json({
        message: "Operation success.",
        body: accessToken
    });
}

export const getMyDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await authService.getMyDetails(req.user.sub);
    res.status(200).json({
        message: "Operation success.",
        body: user
    });
}

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.status(200).json({
        message: "You have been received 6 digit OTP code."
    });
}

export const verifyOTPForResetPassword = async (req: Request, res: Response) => {
    const { email, otp } = req.query;

    if (typeof email !== "string" || typeof otp !== "string") {
        return res.status(400).json({
            message: "Invalid format."
        });
    }

    const resetToken = await authService.verifyOTP(email, otp);

    res.status(200).json({
        message: "OTP verified successfully!",
        body: resetToken
    });
}

export const resetPassword = async (req: Request, res: Response) => {
    const { userEmail, resetToken, newPassword } = req.body;

    if (typeof resetToken !== "string" || typeof newPassword !== "string") {
        return res.status(400).json({
            message: "Invalid format."
        });
    }

    await authService.resetPassword(userEmail, resetToken, newPassword);

    res.status(200).json({
        message: "Password changed successfully!"
    });
}