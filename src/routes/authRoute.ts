import {Router} from "express";
import * as authController from '../controllers/authController';
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";
import {UserRoles} from "../models/userModel";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/access-token", authController.getNewAccessToken);

authRouter.post(
    "/forgot-password",
    authController.forgotPassword
);

authRouter.post(
    "/reset-password",
    authController.resetPassword
)

authRouter.get(
    "/verify-otp",
    authController.verifyOTPForResetPassword
);

authRouter.get("/me", authenticate, authController.getMyDetails);

export default authRouter;