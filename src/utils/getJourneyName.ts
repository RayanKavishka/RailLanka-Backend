import stationModel from "../models/stationModel";
import AppError from "../errors/AppError";


const getJourneyName = async (startStation: string, desStation: string): Promise<string> => {
    try {
        const startStationObj = await stationModel.findById(startStation);
        const desStationObj = await stationModel.findById(desStation);

        if (!startStationObj || !desStationObj) {
            throw new AppError(404, "Something went wrong.");
        }

        return `${startStationObj.stationName} - ${desStationObj.stationName}`;

    } catch (error) {
        console.error("Error in getJourneyName", error);
        throw error;
    }
}


export default getJourneyName;