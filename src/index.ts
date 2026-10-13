import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDatabase from "./database";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());




const serverStart = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(`Server is listening on port: ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};

serverStart();