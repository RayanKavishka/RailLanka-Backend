import IPayment from "../interfaces/IPayment";
import ITicket from "../interfaces/ITicket";
import IJourney from "../interfaces/IJourney";
import IRoute from "../interfaces/IRoute";
import IUser from "../interfaces/IUser";

export type PopulatedJourney = Omit<IJourney, "route"> & {
    route: IRoute;
};

export type PopulatedTicket = Omit<ITicket, "journey" | "passenger"> & {
    journey: PopulatedJourney;
    passenger: IUser;
};

type PopulatedPayment = Omit<IPayment, "ticket"> & {
    ticket: PopulatedTicket;
    createdAt: Date;
};

export default PopulatedPayment;
