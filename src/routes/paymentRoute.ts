import { Router } from "express";
import * as paymentController from "../controllers/paymentController";

const paymentRouter = Router();

paymentRouter.post(
    "/notify",
    paymentController.paymentNotification
);

export default paymentRouter;