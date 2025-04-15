import mongoose from "mongoose";
import Logger from "./Logger";

const logger = Logger.createLogger("DatabaseUtil");

export async function connectToDatabase() {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
  }

  try {
    await mongoose.connect(dbUri, {});
    logger.log("Connected to MongoDB.");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
  }
}
