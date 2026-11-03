import { Ticket } from "../ITicket";


interface ITicketBook {
    routeId: string,
    startStation: string;
    destinationStation: string;
    journeyDate: Date;

    tickets: Ticket[];

    passengerId: string;
    address: string;
    city: string;
}


export default ITicketBook;