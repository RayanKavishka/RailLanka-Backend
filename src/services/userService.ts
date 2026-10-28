import IUser from "../interfaces/IUser";
import UserModel, { UserRoles } from "../models/userModel";
import AppError from "../errors/AppError";
import bcrypt from "bcryptjs";

export const saveAdminOrInspector = async (user: IUser) => {
    console.log("Executes saveAdminOrInspector()");
    try {
        const existingUser = await UserModel.findOne({
            $or: [
                { email: user.email },
                { phone: user.phone }
            ]
        });

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
        console.error("Error in saveAdminOrInspector()", error);
        throw error;
    }
}

export const updateUser = async (user: IUser) => {
    console.log("Executes updateUser()");
    try {
        const userByEmail = await UserModel.findOne({ email: user.email });
        if (userByEmail && userByEmail._id.toString() !== user._id.toString()) {
            throw new AppError(409, "This email is already in use.");
        }

        const userByPhone = await UserModel.findOne({ phone: user.phone });
        if (userByPhone && userByPhone._id.toString() !== user._id.toString()) {
            throw new AppError(409, "This phone is already in use.");
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedUser) {
            throw new AppError(404, "Sorry, related user is not found.");
        }

    } catch (error) {
        console.error("Error in updateUser()", error);
        throw error;
    }
}

export const setStatusAsInactive = async (userId: string) => {
    console.log("Executes setStatusAsInactive()");
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    isActive: false
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedUser) {
            throw new AppError(404, "Sorry, related user is not found.");
        }

    } catch (error) {
        console.error("Error in setStatusAsInactive()", error);
        throw error;
    }
}

export const getUserById = async (userId: string): Promise<IUser> => {
    console.log("Executes getUserById()");
    try {
        const existingUser = await UserModel.findById(userId).select("-password");

        if (!existingUser) {
            throw new AppError(404, "Sorry, related user is not found.");
        }

        return existingUser;

    } catch (error) {
        console.error("Error in getUserById()", error);
        throw error;
    }
}

export const getUsersByRole = async (role: UserRoles): Promise<IUser[]> => {
    console.log("Executes getUsersByRole()");
    try {
        const usersByRole = await UserModel.find({
            $and: [
                { roles:role },
                { isActive: true }
            ]
        }).select("-password");

        if (usersByRole.length === 0) {
            return [];
        }

        return usersByRole;

    } catch (error) {
        console.error("Error in getUsersByRole()", error);
        throw error;
    }
}
