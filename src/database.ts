import mongoose from 'mongoose';

const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_ATLAS_URI as string);
        console.log("MongoDB is connected successfully.");

    } catch (error) {
        console.error("Database connection is failed.");
        throw error;
    }
}

export default connectDatabase;