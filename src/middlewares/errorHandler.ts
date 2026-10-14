
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import AppError from "../errors/AppError";

const errorHandler = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(error);

    if (error instanceof AppError) {
        return res.status(error.status).json({
            message: error.message
        });
    }

    if (error instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(error.errors).map(
            (err) => err.message
        );

        return res.status(400).json({
            message: "Validation failed.",
            errors
        });
    }

    return res.status(500).json({
        message: "Internal server error."
    });
};

export default errorHandler;
