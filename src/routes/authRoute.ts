import { Router } from "express";
import * as authController from '../controllers/authController';
import authenticate from "../middlewares/authenticate";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/access-token", authController.getNewAccessToken);

authRouter.get("/me", authenticate, authController.getMyDetails);

export default authRouter;