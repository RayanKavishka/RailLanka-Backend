import { Router } from "express";
import * as authController from '../controllers/authController';
import authenticateMiddleware from "../middlewares/authenticateMiddleware";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/access-token", authController.getNewAccessToken);
authRouter.get("/me", authenticateMiddleware, authController.getMyDetails);

export default authRouter;