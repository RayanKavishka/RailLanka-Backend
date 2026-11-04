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
    "/filter-routes",
    authenticate,
    authorize(UserRoles.PASSENGER),
    routeController.getRoutesByJourney
);

routeRouter.get(
    "/",
    authenticate,
    authorize(UserRoles.ADMIN, UserRoles.PASSENGER),
    routeController.getAllRoutes
);

routeRouter.get(
    "/:routeId",
    authenticate,
    authorize(UserRoles.ADMIN, UserRoles.PASSENGER),
    routeController.getRouteById
);

routeRouter.patch(
    "/:routeId",
    authenticate,
    authorize(UserRoles.ADMIN),
    routeController.setStatusAsInactive
);


export default routeRouter;