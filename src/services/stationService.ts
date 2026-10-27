import IStation from "../interfaces/IStation";
import StationModel from "../models/stationModel";
import AppError from "../errors/AppError";

export const addStation = async (station: IStation) => {
    console.log("Executes addStation()");
    try {
        const existingStation = await StationModel.findOne({ stationCode: station.stationCode });

        if (existingStation) {
            throw new AppError(409, "station is already exist.");
        }

        const newStation = new StationModel({
            stationName: station.stationName,
            stationCode: station.stationCode,
            location: station.location,
            address: station.address,
            isActive: true
        });

        await newStation.save();

    } catch (error) {
        console.error("Error in addStation()", error);
        throw error;
    }
}

export const updateStation = async (station: IStation) => {
    console.log("Executes updateStation()");
    try {
        const updatedStation = await StationModel.findOneAndUpdate(
            { stationCode: station.stationCode },
            {
                $set: {
                    stationName: station.stationName,
                    location: station.location,
                    address: station.address,
                    isActive: station.isActive
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedStation) {
            throw new AppError(404, "Sorry, related station is not found.");
        }

    } catch (error) {
        console.error("Error in updateStation()", error);
        throw error;
    }
}

export const getStationById = async (stationId: string): Promise<IStation> => {
    console.log("Executes getStationById()");
    try {
        if (!stationId) {
            throw new AppError(400, "Station is required.");
        }

        const station = await StationModel.findOne({
            _id: stationId,
            isActive: true
        });

        if (!station) {
            throw new AppError(404, "Sorry, related station is not found.");
        }

        return station;

    } catch (error) {
        console.error("Error in getStationById()", error);
        throw error;
    }
}

export const getAllStations = async (): Promise<IStation[]> => {
    console.log("Executes getAllStations()");
    try {

        return await StationModel.find({ isActive: true })

    } catch (error) {
        console.error("Error in getAllStations()", error);
        throw error;
    }
}

export const setStatusAsInactive = async (stationId: string) => {
    console.log("Executes setStatusAsInactive()");

    try {
        if (!stationId) {
            throw new AppError(400, "Station is required.");
        }

        const updatedStation = await StationModel.findByIdAndUpdate(
            stationId,
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

        if (!updatedStation) {
            throw new AppError(404, "Station is not found.");
        }

        return updatedStation;

    } catch (error) {
        console.error("Error in setStatusAsInactive()", error);
        throw error;
    }
}