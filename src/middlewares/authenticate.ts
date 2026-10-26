import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
    user?: any
}

const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader: string | undefined = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Token is not found."
            });
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. Invalid token format."
            });
        }

        const token = authHeader.split(" ")[1];

        const payload = jwt.verify(token, JWT_SECRET);

        req.user = payload;

        next();

    } catch (error) {
        console.error(error);
        return res.status(401).json({
            message: "Token is invalid or expired"
        });
    }
}


export default authenticate;