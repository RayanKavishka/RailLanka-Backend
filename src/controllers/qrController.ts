import { Request, Response } from "express";
import * as qrService from "../services/qrService";


export const scanQR = async (req: Request, res: Response) => {
    const { qrToken } = req.query;

    const result: string = await qrService.verifyQR(qrToken as string);

    res.status(200).json({
        message: "operation success.",
        body: result
    });
}