import { Response } from "express";
import * as ticketService from "../services/ticketService";
import { AuthRequest } from "../middlewares/authenticate";


export const geAllTicketsByPassengerId = async (req: AuthRequest, res: Response) => {
    const passengerId = req.user?.sub;
    if (!passengerId) {
        return res.status(401).json({
            message: "Authentication required."
        });
    }

    const tickets = await ticketService.geAllTicketsByPassengerId(passengerId);

    res.status(200).json({
        message: "Operation success.",
        body: tickets
    });
}