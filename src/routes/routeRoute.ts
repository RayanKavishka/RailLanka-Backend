import {Router} from "express";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";
import {UserRoles} from "../models/userModel";
import * as routeController from "../controllers/routeController";


const routeRouter = Router();

routeRouter.post(
    "/",
    authenticate,
    authorize(UserRoles.ADMIN),
    routeController.saveRoute
);

routeRouter.put(
    "/",
    authenticate,
    authorize(UserRoles.ADMIN),
    routeController.updateRoute
);

routeRouter.get(
    "/:routeId",
    authenticate,
    authorize(UserRoles.ADMIN, UserRoles.PASSENGER),
    routeController.getRouteById
);

routeRouter.get(
    "/",
    authenticate,
    authorize(UserRoles.ADMIN, UserRoles.PASSENGER),
    routeController.getAllRoutes
);

routeRouter.patch(
    "/:routeId",
    authenticate,
    authorize(UserRoles.ADMIN),
    routeController.setStatusAsInactive
);


export default routeRouter;