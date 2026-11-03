import { Request, Response } from "express";
import * as journeyService from "../services/journeyService";

export const bookingTicketController = async (req: Request, res: Response) => {
    const checkoutData = await journeyService.bookingTickets(req.body);

    res.status(201).json({
        success: true,
        message: "Ticket booking initialized successfully.",
        data: checkoutData
    });
};