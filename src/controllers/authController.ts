import * as authService from '../services/authService';
import { Request, Response, NextFunction } from "express";
import {signAccessToken, signRefreshToken} from "../utils/jwtUtil";
import AppError from "../errors/AppError";

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
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.log(error);
        throw error;
    }
}