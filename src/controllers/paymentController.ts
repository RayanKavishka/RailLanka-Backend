import { Request, Response } from "express";
import * as paymentService from "../services/paymentService";
import * as qrService from "../services/qrService";
import {AuthRequest} from "../middlewares/authenticate";

export const paymentNotification = async (req: Request, res: Response) => {
    await paymentService.handlePaymentNotification(req.body);

    res.status(200).json({
        message: "Operation success."
    });
};

export const getPaymentTicket = async (req: AuthRequest, res: Response) => {
    if (typeof req.params.paymentId !== 'string') {
        return res.status(400).json({
            message: "Payment is not valid."
        });
    }

    const body = await qrService.getPaymentTicket(
        req.params.paymentId,
        req.user!.sub
    );

    res.status(200).json({
        message: "Operation success.",
        body
    });
};

export const getAllPaymentsByPage = async (req: AuthRequest, res: Response) => {
    const { page, size } = req.query;

    const pageN = Number(page ?? 1);
    const sizeN = Number(size ?? 10);

    if (
        !Number.isInteger(pageN) ||
        !Number.isInteger(sizeN) ||
        pageN < 1 ||
        sizeN < 1 ||
        sizeN > 7
    ) {
        return res.status(400).json({
            message: "Something went wrong."
        });
    }

    const paymentsRes = await paymentService.getAllPayments(pageN, sizeN);

    res.status(200).json({
        message: "Operation success.",
        body: paymentsRes
    });
}