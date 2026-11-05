import { Request, Response } from "express";
import * as journeyService from "../services/journeyService";
import { AuthRequest } from "../middlewares/authenticate";

export const bookingTicketController = async (req: AuthRequest, res: Response) => {
    if (!req.user.sub) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    const passengerId = req.user?.sub.toString();

    if (!passengerId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    const reqBody = {
        routeId: req.body.routeId,
        startStation: req.body.startStation,
        destinationStation: req.body.destinationStation,
        journeyDate: req.body.journeyDate,
        tickets: req.body.tickets,
        address: req.body.address,
        city: req.body.city,
        passengerId
    };

    const checkoutData = await journeyService.bookingTickets(reqBody);

    res.status(201).json({
        message: "Ticket booking initialized successfully.",
        data: checkoutData
    });
};


export const getTicketPricesForAllClass = async (req: Request, res: Response) => {
    const { startStationId, destinationStationId } = req.query;

    if (
        typeof startStationId !== "string" ||
        typeof destinationStationId !== "string"
    ) {
        return res.status(400).json({
            message: "Invalid details."
        });
    }

    const ticketPrices = await journeyService.getTicketPrices({ startStationId, destinationStationId });

    res.status(200).json({
        message: "Operation success.",
        body: ticketPrices
    });
}