import express from 'express';
import cors from 'cors';
import connectDatabase from "./database";
import errorHandler from "./middlewares/errorHandler";
import authRouter from "./routes/authRoute";
import configureSuperAdmin from "./configs/superAdminConfig";
import dotenv from 'dotenv';
import stationRouter from "./routes/stationRoute";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/stations", stationRouter);


app.use(errorHandler);

const serverStart = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(`Server is listening on port: ${PORT}`);
        });

        await configureSuperAdmin();

    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};

serverStart();