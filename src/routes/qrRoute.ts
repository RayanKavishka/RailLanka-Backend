import {Router} from "express";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";
import {UserRoles} from "../models/userModel";
import * as qrController from "../controllers/qrController";


const qrRouter = Router();

qrRouter.get(
    "/verify",
    authenticate,
    authorize(UserRoles.TICKET_INSPECTOR, UserRoles.ADMIN),
    qrController.scanQR
);


export default qrRouter;