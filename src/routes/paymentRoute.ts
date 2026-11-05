import {Router} from "express";
import * as paymentController from "../controllers/paymentController";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";
import {UserRoles} from "../models/userModel";

const paymentRouter = Router();

paymentRouter.post(
    "/notify",
    paymentController.paymentNotification
);

paymentRouter.get(
    "/:paymentId/ticket",
    authenticate,
    authorize(UserRoles.PASSENGER),
    paymentController.getPaymentTicket
);

export default paymentRouter;