import mongoose from "mongoose";
import * as stationService from "../services/stationService";
import { Request, Response } from "express";
import IStation from "../interfaces/IStation";

export const saveStation = async (req: Request, res: Response) => {
    const station: IStation = req.body;
    await stationService.addStation(station);

    res.status(201).json({
        message: "Operation success."
    });
}

export const updateStation = async (req: Request, res: Response) => {
    const station: IStation = req.body;
    await stationService.updateStation(station);

    res.status(200).json({
        message: "Operation success."
    });
}

export const getStationById = async (req: Request, res: Response) => {
    const stationId = req.params.stationId;
    if (typeof stationId !== "string" || !mongoose.isValidObjectId(stationId)) {
        return res.status(400).json({
            message: "This station is not available."
        });
    }

    const station = await stationService.getStationById(stationId);

    res.status(200).json({
        message: "Operation success.",
        body: station
    });
}

export const getAllStations = async (req: Request, res: Response) => {
    const allStations = await stationService.getAllStations();
    res.status(200).json({
        message: "Operation success.",
        body: allStations
    });
}

export const setStatusAsInactive = async (req: Request, res: Response) => {
    const stationId = req.params.stationId;
    if (typeof stationId !== "string" || !mongoose.isValidObjectId(stationId)) {
        return res.status(400).json({
            message: "This station is not available."
        });
    }

    await stationService.setStatusAsInactive(stationId);

    res.status(200).json({
        message: "Operation success."
    });
}