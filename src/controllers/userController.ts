import * as userService from "../services/userService";
import {Request, Response} from "express";
import mongoose from "mongoose";
import {UserRoles} from "../models/userModel";
import IUser from "../interfaces/IUser";

export const saveAdminOrInspector = async (req: Request, res: Response) => {
    const user = req.body;
    await userService.saveAdminOrInspector(user);

    res.status(201).json({
        message: "Operation success."
    });
}

export const updateUser = async (req: Request, res: Response) => {
    const user = req.body;
    await userService.updateUser(user);

    res.status(200).json({
        message: "Operation success."
    });
}

export const setStatusAsInactive = async (req: Request, res: Response) => {
    const userId = req.params.userId;
    if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
            message: "This user is not found."
        });
    }

    await userService.setStatusAsInactive(userId);

    res.status(200).json({
        message: "Operation success."
    });
}

export const getUserById = async (req: Request, res: Response): Promise<IUser | any> => {
    const userId = req.params.userId;
    if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
            message: "This user is not found."
        });
    }

    const user = await userService.getUserById(userId);

    res.status(200).json({
        message: "Operation success.",
        body: user
    });
}

export const getUsersByRole = async (req: Request, res: Response): Promise<IUser | any> => {
    const role = req.query.role;

    if (typeof role !== "string" || !Object.values(UserRoles).includes(role as UserRoles)) {
        return res.status(400).json({
            message: "Invalid user role."
        });
    }

    const users = await userService.getUsersByRole(role as UserRoles);

    res.status(200).json({
        message: "Operation success.",
        body: users
    });
}

