import { AuthRequest } from "./authenticateMiddleware";
import { Response, NextFunction } from "express";

const authorization = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        if (!roles.some((role) => req.user.roles.includes(role))) {
            return res.status(403).json({
                message: "Access denied."
            });
        }

        next();
    }
}


export default authorization;