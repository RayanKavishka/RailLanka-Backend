import {AuthRequest} from "./authenticate";
import {NextFunction, Response} from "express";
import {UserRoles} from "../models/userModel";

const authorize = (...roles: UserRoles[]) => {
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


export default authorize;