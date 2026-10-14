import bcrypt from 'bcryptjs';
import UserModel, {IUser} from "../models/userModel";
import AppError from "../errors/AppError";

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
        console.error("Error in regiterUser()", error);
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
        console.error("Error in login()", error);
        throw error;
    }
}