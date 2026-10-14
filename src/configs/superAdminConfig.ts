import bcrypt from "bcryptjs";
import UserModel from "../models/userModel";
import AppError from "../errors/AppError";

const configureSuperAdmin = async (): Promise<void> => {
    try {
        const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
        const password = process.env.SUPER_ADMIN_PASSWORD;
        const phone = process.env.SUPER_ADMIN_PHONE;

        if (!email || !password || !phone) {
            console.log("Super-admin environment variables are missing.");
            throw new AppError(500, "Internal server error.");
        }

        const exSuperAdmin = await UserModel.findOne({ email });

        if (exSuperAdmin) {
            console.log("Super-admin already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const superAdmin = new UserModel({
            fullName: "Rayan Kavishka",
            email,
            password: hashedPassword,
            phone,
            roles: ["ADMIN", "PASSENGER", "TICKET_INSPECTOR"],
            isActive: true
        });

        await superAdmin.save();
        console.log("Super-admin created successfully.");

    } catch (error) {
        console.error("Error in configureSuperAdmin():", error);
        throw error;
    }
};


export default configureSuperAdmin;