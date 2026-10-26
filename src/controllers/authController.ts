import * as authService from '../services/authService';
import { Request, Response, NextFunction } from "express";
import {signAccessToken, signRefreshToken} from "../utils/jwtUtil";
import AppError from "../errors/AppError";
import {AuthRequest} from "../middlewares/authenticate";

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