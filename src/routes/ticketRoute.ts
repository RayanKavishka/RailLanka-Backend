import { Router } from "express";
import authorize from "../middlewares/authorize";
import authenticate from "../middlewares/authenticate";
import { UserRoles } from "../models/userModel";
import * as ticketController from "../controllers/ticketController";


const ticketRouter = Router();

ticketRouter.get(
    "/my",
    authenticate,
    authorize(UserRoles.PASSENGER),
    ticketController.geAllTicketsByPassengerId
);



export default ticketRouter;