import {Router} from "express"
import * as userController from "../controllers/userController";
import authorize from "../middlewares/authorize";
import authenticate from "../middlewares/authenticate";
import {UserRoles} from "../models/userModel";

const userRouter = Router();

userRouter.post(
    "/",
    authenticate,
    authorize(UserRoles.ADMIN),
    userController.saveAdminOrInspector
);

userRouter.put(
    "/",
    authenticate,
    authorize(UserRoles.ADMIN, UserRoles.PASSENGER, UserRoles.TICKET_INSPECTOR),
    userController.updateUser
);

userRouter.patch(
    "/",
    authenticate,
    authorize(UserRoles.ADMIN),
    userController.setStatusAsInactive
);

userRouter.get(
    "/:userId",
    authenticate,
    authorize(UserRoles.ADMIN, UserRoles.PASSENGER, UserRoles.TICKET_INSPECTOR),
    userController.getUserById
);

userRouter.get(
    "/",
    authenticate,
    authorize(UserRoles.ADMIN),
    userController.getUsersByRole
);


export default userRouter;