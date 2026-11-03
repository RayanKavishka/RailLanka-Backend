import { Request, Response } from "express";
import * as paymentService from "../services/paymentService";

export const paymentNotification = async (req: Request, res: Response) => {
    await paymentService.handlePaymentNotification(req.body);

    res.status(200).json({
        message: "Operation success."
    });
};