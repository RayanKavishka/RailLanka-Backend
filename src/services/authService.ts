import bcrypt from 'bcryptjs';
import UserModel from "../models/userModel";
import jwt from 'jsonwebtoken';
import AppError from "../errors/AppError";
import {signAccessToken} from "../utils/jwtUtil";
import IUser from "../interfaces/IUser";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const registerUser = async (user: IUser) => {
    console.log("Executes registerUser()");
    try {
        const existingUser = await UserModel.findOne({ email: user.email });

        if (existingUser) {
            throw new AppError(409, "User is already exist.");
        }

        const hashedPassword = await bcrypt.hash(user.password, 12);

        const newUser = new UserModel({
            fullName: user.fullName,
            email: user.email,
            password: hashedPassword,
            phone: user.phone,
            roles: user.roles,
            isActive: true
        });

        await newUser.save();

    } catch (error) {
        console.error("Error in regiterUser(): ", error);
        throw error;
    }
}

export interface AuthDTO {
    email: string,
    password: string
}

export const login = async (auth: AuthDTO): Promise<IUser> => {
    console.log("Executes login()");
    try {
        if (!auth.email || !auth.password) {
            throw new AppError(400, "Email and Password are required.");
        }

        const user = await UserModel.findOne({ email: auth.email });

        if (!user) {
            throw new AppError(401, "Invalid email or password.");
        }

        const isValid = await bcrypt.compare(auth.password, user.password);

        if (!isValid) {
            throw new AppError(401, "Invalid email or password.");
        }

        return user;

    } catch (error) {
        console.error("Error in login(): ", error);
        throw error;
    }
}

export const getNewAccessToken = async (refreshToken: string): Promise<string> => {
    console.log("Executes getNewAccessToken()");
    try {
        let payload: jwt.JwtPayload;

        try {
            payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;

        } catch {
            throw new AppError(401, "Token is expired or Invalid token.");
        }

        const user = await UserModel.findById(payload?.sub);

        if (!user) {
            throw new AppError(401, "Token is expired or Invalid token.");
        }

        return signAccessToken(user);

    } catch (error) {
        console.error("Error in getNewAccessToken(): ", error);
        throw error;
    }
}

export const getMyDetails = async (userId: string): Promise<IUser> => {
    try {
        const user = await UserModel.findById(userId).select("-password");

        if (!user) {
            throw new AppError(404, "Related user not found.");
        }

        return user;

    } catch (error) {
        console.error("Error in getMyDetails(): ", error);
        throw error;
    }
};