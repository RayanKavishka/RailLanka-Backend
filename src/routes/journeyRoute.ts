import { Router } from "express";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";
import {UserRoles} from "../models/userModel";
import * as journeyController from "../controllers/journeyController";


const journeyRouter = Router();

journeyRouter.post(
    "/",
    authenticate,
    authorize(UserRoles.PASSENGER),
    journeyController.bookingTicketController
);

journeyRouter.get(
    "/",
    authenticate,
    authorize(UserRoles.PASSENGER),
    journeyController.getTicketPricesForAllClass
);



export default journeyRouter;