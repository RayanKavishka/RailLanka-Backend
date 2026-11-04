import { Request, Response } from "express";
import * as routeService from "../services/routeService";
import IRouteRequest from "../interfaces/request/IRouteRequest";
import mongoose from "mongoose";
import IRouteResponse from "../interfaces/response/IRouteResponse";
import {routeRequest} from "../services/routeService";


export const saveRoute = async (req: Request, res: Response) => {
    const route: IRouteRequest = req.body;
    await routeService.addRoute(route);

    res.status(201).json({
        message: "Operation success."
    });
}

export const updateRoute = async (req: Request, res: Response) => {
    const route: IRouteRequest = req.body;
    await routeService.updateRoute(route);

    res.status(200).json({
        message: "Operation success."
    });
}

export const getRouteById = async (req: Request, res: Response) => {
    const routeId = req.params.routeId;
    if (typeof routeId !== "string" || !mongoose.isValidObjectId(routeId)) {
        return res.status(400).json({
            message: "This route is not found."
        });
    }

    const route = await routeService.getRouteById(routeId);

    res.status(200).json({
        message: "Operation success.",
        body: route
    });
}

export const getAllRoutes = async (req: Request, res: Response) => {
    const allRoutes: IRouteResponse[] = await routeService.getAllRoutes();

    res.status(200).json({
        message: "Operation success.",
        body: allRoutes
    });
}

export const setStatusAsInactive = async (req: Request, res: Response) => {
    const routeId = req.params.routeId;
    if (typeof routeId !== "string" || !mongoose.isValidObjectId(routeId)) {
        return res.status(400).json({
            message: "This route is not found."
        });
    }

    await routeService.setStatusAsInactive(routeId);

    res.status(200).json({
        message: "Operation success."
    });
}

export const getRoutesByJourney = async (req: Request, res: Response) => {
    const { startStationId, destinationStationId, journeyDate } = req.query;

    if (
        typeof startStationId !== "string" ||
        typeof destinationStationId !== "string" ||
        typeof journeyDate !== "string"
    ) {
        return res.status(400).json({
            message: "Invalid journey parameters."
        });
    }

    const jDate = new Date(journeyDate);

    if (isNaN(jDate.getTime())) {
        return res.status(400).json({
            message: "Invalid journey date."
        });
    }

    const responseRoutes = await routeService.getRoutesByJourney({
        startStationId,
        destinationStationId,
        journeyDate: jDate
    });

    res.status(200).json({
        message: "Operation success.",
        body: responseRoutes
    });
};