import {Router} from "express";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";
import {UserRoles} from "../models/userModel";
import {askAI} from "../controllers/aiAgentController";

const aiRouter = Router();

aiRouter.post(
    "/ask",
    authenticate,
    authorize(UserRoles.PASSENGER),
    askAI
);


export default aiRouter;