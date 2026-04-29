import mongoose from "mongoose";

export const connectDB = async (mongoUri) => {
  // Required for some networks/Atlas setups; harmless for local Mongo.
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    family: 4,
  });
};
