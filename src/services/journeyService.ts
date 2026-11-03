
import ITicketBook from "../interfaces/request/ITicketBook";
import JourneyModel, { TicketClass } from "../models/journeyModel";
import mongoose from "mongoose";
import TicketModel from "../models/ticketModel";
import StationModel from "../models/stationModel";
import AppError from "../errors/AppError";
import PaymentModel, {PayMethod, PayStatus} from "../models/paymentModel";
import {generatePayHereHash} from "./payhereService";
import payhereConfig from "../configs/payhere";
import UserModel from "../models/userModel";

type CalPrice = {
    distanceKm: number;
    classType: TicketClass;
    ticketCount: number;
};

const calculateTicketsPrice = ({
   distanceKm,
   classType,
   ticketCount
}: CalPrice) => {

    let pricePerKm: number = 0;

    if (0 < distanceKm && distanceKm <= 10) {
        pricePerKm =
            classType === TicketClass.FIRST_CLASS ? 10.40 :
                classType === TicketClass.SECOND_CLASS ? 5.20 :
                    classType === TicketClass.THIRD_CLASS ? 2.60 :
                        0;

    } else if (distanceKm <= 50) {
        pricePerKm =
            classType === TicketClass.FIRST_CLASS ? 9.60 :
                classType === TicketClass.SECOND_CLASS ? 4.80 :
                    classType === TicketClass.THIRD_CLASS ? 2.40 :
                        0;

    } else if (distanceKm <= 100) {
        pricePerKm =
            classType === TicketClass.FIRST_CLASS ? 6.80 :
                classType === TicketClass.SECOND_CLASS ? 3.40 :
                    classType === TicketClass.THIRD_CLASS ? 1.70 :
                        0;

    } else if (distanceKm <= 200) {
        pricePerKm =
            classType === TicketClass.FIRST_CLASS ? 5.60 :
                classType === TicketClass.SECOND_CLASS ? 2.80 :
                    classType === TicketClass.THIRD_CLASS ? 1.40 :
                        0;

    } else {
        pricePerKm =
            classType === TicketClass.FIRST_CLASS ? 4.40 :
                classType === TicketClass.SECOND_CLASS ? 2.20 :
                    classType === TicketClass.THIRD_CLASS ? 1.10 :
                        0;
    }

    if (pricePerKm === 0) {
        throw new AppError(400, "Invalid ticket class.");
    }

    const ticketPrice = Number((distanceKm * pricePerKm).toFixed(2));

    return {
        ticketsPrice: ticketPrice * ticketCount
    };
};

const getDataFromOSRM = async (
    startStationId: string,
    destinationStationId: string
) => {
    const [startStation, desStation] = await Promise.all([
        StationModel.findById(startStationId),
        StationModel.findById(destinationStationId)
    ]);

    if (!startStation || !desStation) {
        throw new AppError(404, "Locations mismatched.");
    }

    const startLatitude = startStation.location.latitude;
    const startLongitude = startStation.location.longitude;

    const desLatitude = desStation.location.latitude;
    const desLongitude = desStation.location.longitude;

    const url = `https://router.project-osrm.org/route/v1/driving/${startLongitude},${startLatitude};${desLongitude},${desLatitude}?overview=false`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new AppError(502, "OSRM service is unavailable.");
    }

    const data = await response.json();

    if (data.code !== "Ok" || !data.routes?.length) {
        throw new AppError(404, "Unable to find route.");
    }

    return data;
};


// Services ------------------------------------------------------------------------------------------------------------

export const bookingTickets = async (ticketData: ITicketBook) => {
    console.log("Executes bookingTicket()");

    const session = await mongoose.startSession();

    try {
        const result = await session.withTransaction(async () => {

            const journeyData = await getDataFromOSRM(
                ticketData.startStation,
                ticketData.destinationStation
            );

            const distanceKm: number = journeyData.routes[0].distance / 1000;
            const durationMinutes: number = Math.ceil(
                journeyData.routes[0].duration / 60
            );

            const ticketPrices = ticketData.tickets.map((ticket) => {
                return calculateTicketsPrice({
                    distanceKm,
                    classType: ticket.class,
                    ticketCount: ticket.ticketCount
                });
            });

            const totalTicketsPrice = ticketPrices.reduce((total, ticket) => {
                return total + ticket.ticketsPrice;
            }, 0);


            const passenger = await UserModel.findById(
                ticketData.passengerId
            ).session(session);

            if (!passenger || !passenger.isActive) {
                throw new AppError(404, "Passenger not found or inactive.");
            }


            const newJourney = new JourneyModel({
                route: ticketData.routeId,
                startStation: ticketData.startStation,
                destinationStation: ticketData.destinationStation,
                journeyDuration: durationMinutes,
                journeyDate: ticketData.journeyDate
            });

            const savedJourney = await newJourney.save({ session });

            const newTicket = new TicketModel({
                journey: savedJourney._id,
                passenger: passenger._id,
                tickets: ticketData.tickets,
                totalPrice: totalTicketsPrice
            });

            const savedTicket = await newTicket.save({ session });

            const newPayment = new PaymentModel({
                ticket: savedTicket._id,
                paymentMethod: PayMethod.PAYHERE,
                amount: savedTicket.totalPrice,
                paymentStatus: PayStatus.PENDING
            });

            const savedPayment = await newPayment.save({ session });

            const paymentId = savedPayment._id.toString();

            const hash = generatePayHereHash({
                paymentId,
                amount: savedPayment.amount,
                currency: "LKR"
            });

            const nameParts = passenger.fullName.trim().split(/\s+/);

            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ") || firstName;

            const checkoutData = {
                merchant_id: payhereConfig.merchantId,
                return_url: `${process.env.FRONTEND_URL}/payment/success`,
                cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
                notify_url: `${process.env.BACKEND_URL}/api/v1/payments/notify`,
                first_name: firstName,
                last_name: lastName,
                email: passenger.email,
                phone: passenger.phone,
                address: ticketData.address,
                city: ticketData.city,
                country: "Sri Lanka",
                order_id: paymentId,
                items: `RailLanka Ticket - ${savedTicket._id}`,
                currency: "LKR",
                amount: savedPayment.amount.toFixed(2),
                hash
            };

            return {
                ticketId: savedTicket._id.toString(),
                paymentId,
                checkoutUrl: payhereConfig.checkoutUrl,
                checkoutData
            };

        });

        return result;

    } catch (error) {
        console.log("Error in bookingTicket()", error);
        throw error;

    } finally {
        await session.endSession();
    }
};





// const routeStations = await RouteStationModel.find({
//     isActive: true,
//     stations: {
//         $all: [
//             { $elemMatch: { station: ticketData.startStation } },
//             { $elemMatch: { station: ticketData.destinationStation } }
//         ]
//     }
// });
//
// const validRoutes: IRouteStation[] = routeStations.filter((route) => {
//     const startIndex: number = route.stations.findIndex((item) =>
//         item.station.toString() === ticketData.startStation.toString()
//     );
//
//     const destinationIndex:number = route.stations.findIndex((item) =>
//         item.station.toString() === ticketData.destinationStation.toString()
//     );
//
//     return startIndex < destinationIndex;
// });


// console.log("Executes bookingTicket()");
// try {
//
//
// } catch (error) {
//     console.log("Error in bookingTicket()",error);
//     throw error;
// }