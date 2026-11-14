import { Response } from "express";
import { askAssistant } from "../services/aiAgentService";
import { AuthRequest } from "../middlewares/authenticate";

export const askAI = async (req: AuthRequest, res: Response) => {
    try {
        const { question } = req.body;
        const passengerId = (req as any).user?.sub;

        const reply = await askAssistant(question, passengerId);

        res.status(200).json({
            message: "Operation success.",
            reply
        });

    } catch (error) {
        res.status(500).json({
            reply: "Something went wrong. Please try again."
        });
    }
};