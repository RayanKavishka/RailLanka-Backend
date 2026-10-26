import {Router} from "express";
import * as stationController from "../controllers/stationController";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";
import {UserRoles} from "../models/userModel";

const stationRouter = Router();

// Admin only
stationRouter.post(
    "/",
    authenticate,
    authorize(UserRoles.ADMIN),
    stationController.saveStation
);

stationRouter.put(
    "/",
    authenticate,
    authorize(UserRoles.ADMIN),
    stationController.updateStation
);

stationRouter.patch(
    "/:stationId/status",
    authenticate,
    authorize(UserRoles.ADMIN),
    stationController.setStatusAsInactive
);


// Admin & Passenger only
stationRouter.get(
    "/:stationId",
    authenticate,
    authorize(UserRoles.ADMIN, UserRoles.PASSENGER),
    stationController.getStationById
);

stationRouter.get(
    "/",
    authenticate,
    authorize(UserRoles.ADMIN, UserRoles.PASSENGER),
    stationController.getAllStations
);


export default stationRouter;