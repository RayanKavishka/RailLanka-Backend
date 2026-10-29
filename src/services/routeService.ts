import IRouteRequest from "../interfaces/request/IRouteRequest";
import RouteModel from "../models/routeModel";
import AppError from "../errors/AppError";
import RouteStationModel from "../models/routeStationModel";
import mongoose from "mongoose";
import IRoute from "../interfaces/IRoute";
import IRouteResponse from "../interfaces/response/IRouteResponse";
import { INestedStation } from "../interfaces/IStation";

export const addRoute = async (route: IRouteRequest) => {
    console.log("Executes addRoute()");

    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {

            const existingRoute = await RouteModel.findOne({
                routeCode: route.routeCode
            }).session(session);

            if (existingRoute) {
                throw new AppError(409, "A route with this route code already exists.");
            }

            const newRoute = new RouteModel({
                routeName: route.routeName,
                routeCode: route.routeCode,
                description: route.description,
                estimatedDurationHours: route.estimatedDurationHours
            });

            const savedRoute = await newRoute.save({ session });

            const newRouteStation = new RouteStationModel({
                routeId: savedRoute._id,
                stations: route.stations,
                isActive: true
            });

            await newRouteStation.save({ session });

        });

    } catch (error) {
        console.error("Error in addRoute()", error);
        throw error;

    } finally {
        await session.endSession();
    }
}

export const updateRoute = async (route: IRouteRequest) => {
    console.log("Executes updateRoute()");

    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {

            if (!mongoose.isValidObjectId(route.routeId)) {
                throw new AppError(400, "Invalid route ID.");
            }

            const updatedRoute = await RouteModel.findByIdAndUpdate(
                route.routeId,
                {
                    $set: {
                        routeName: route.routeName,
                        routeCode: route.routeCode,
                        description: route.description,
                        estimatedDurationHours: route.estimatedDurationHours
                    }
                },
                {
                    new: true,
                    runValidators: true,
                    session
                }
            );

            if (!updatedRoute) {
                throw new AppError(404, "Sorry, related route is not found.");
            }

            const updatedRouteStation = await RouteStationModel.findOneAndUpdate(
                { route: route.routeId },
                {
                    $set: {
                        stations: route.stations
                    }
                },
                {
                    new: true,
                    runValidators: true,
                    session
                }
            );

            if (!updatedRouteStation) {
                throw new AppError(404, "Sorry, related stations of this route are not found.");
            }

        });

    } catch (error) {
        console.error("Error in updateRoute()", error);
        throw error;

    } finally {
        await session.endSession();
    }
}

export const getRouteById = async (routeId: string): Promise<IRouteResponse> => {
    console.log("Executes getRouteById()");
    try {

        if (!mongoose.isValidObjectId(routeId)) {
            throw new AppError(400, "Invalid route ID.");
        }

        const existingRoute = await RouteStationModel
            .findOne({route: routeId})
            .populate<{ route: IRoute | null }>("route")
            .populate<{ stations: INestedStation[] }>({
                path: "stations.station",
                match: { isActive: true }
            });

        if (!existingRoute) {
            throw new AppError(404, "Sorry, related route is not found.");
        }

        if (!existingRoute.route) {
            throw new AppError(404, "Related route is not found or inactive.");
        }

        const routeData:IRouteResponse = {
            routeId: existingRoute.route._id.toString(),
            routeName: existingRoute.route.routeName,
            routeCode: existingRoute.route.routeCode,
            description: existingRoute.route.description,
            estimatedDurationHours: existingRoute.route.estimatedDurationHours,

            stations: existingRoute.stations.map((item: INestedStation) => {
                if (!item.station) {
                    throw new AppError(404, "Related station is not found.");
                }

                return {
                    stationId: item.station._id.toString(),
                    stationName: item.station.stationName,
                    stationCode: item.station.stationCode,
                    location: {
                        latitude: item.station.location.latitude,
                        longitude: item.station.location.longitude
                    },
                    address: item.station.address,

                    arrivalTime: item.arrivalTime,
                    departureTime: item.departureTime
                }
            })
        }

        return routeData;

    } catch (error) {
        console.error("Error in getRouteById()", error);
        throw error;
    }
}

export const getAllRoutes = async (): Promise<IRouteResponse[]> => {
    console.log("Executes getAllRoutes()");
    try {
        const allRoutes = await RouteStationModel
            .find({ isActive: true })
            .populate<{ route: IRoute | null }>("route")
            .populate<{ stations: INestedStation[] }>({
                path: "stations.station",
                match: { isActive: true }
            });

        return allRoutes
            .filter((obj) =>
                obj.route !== null &&
                obj.stations.length >= 2 &&
                obj.stations.every((item) => item.station !== null)
            )
            .map((obj): IRouteResponse => ({
                routeId: obj.route!._id.toString(),
                routeName: obj.route!.routeName,
                routeCode: obj.route!.routeCode,
                description: obj.route!.description,
                estimatedDurationHours: obj.route!.estimatedDurationHours,

                stations: obj.stations.map((item) => ({
                    stationId: item.station!._id.toString(),
                    stationName: item.station!.stationName,
                    stationCode: item.station!.stationCode,
                    location: {
                        latitude: item.station!.location.latitude,
                        longitude: item.station!.location.longitude
                    },
                    address: item.station!.address,
                    arrivalTime: item.arrivalTime,
                    departureTime: item.departureTime
                }))

            }));

    } catch (error) {
        console.error("Error in getAllRoutes()", error);
        throw error;
    }
}

export const setStatusAsInactive = async (routeId: string) => {
    console.log("Executes setStatusAsInactive()");
    try {
        const updatedRoute = await RouteStationModel.findOneAndUpdate(
            { route: routeId },
            {
                $set: {
                    isActive: false
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedRoute) {
            throw new AppError(404, "Sorry related route is not found.");
        }

    } catch (error) {
        console.error("Error in setStatusAsInactive()", error);
        throw error;
    }
}