import express from 'express';
import cors from 'cors';
import connectDatabase from "./database";
import errorHandler from "./middlewares/errorHandler";
import authRouter from "./routes/authRoute";
import configureSuperAdmin from "./configs/superAdminConfig";
import stationRouter from "./routes/stationRoute";
import userRouter from "./routes/userRoute";
import routeRouter from "./routes/routeRoute";
import journeyRouter from "./routes/journeyRoute";
import paymentRouter from "./routes/paymentRoute";
import qrRouter from "./routes/qrRoute";
import ticketRouter from "./routes/ticketRoute";
import dotenv from 'dotenv';
dotenv.config();


export const app = express();

const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: [
            'https://raillanka.vercel.app',
            'http://localhost:3000',
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
    res.status(200).json({
        message: "ok"
    });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/stations", stationRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/routes", routeRouter);
app.use("/api/v1/journeys", journeyRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/qrs", qrRouter);
app.use("/api/v1/tickets", ticketRouter);


app.use(errorHandler);

const serverStart = async () => {
    try {
        await connectDatabase();

        app.listen(PORT as number, '0.0.0.0', () => {
            console.log(`Server is listening on port: ${PORT}`);
        });

        await configureSuperAdmin();

    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};

serverStart();