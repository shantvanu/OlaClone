// src/server.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
import { log } from "./utils/logger";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/rideApp";

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    log("MongoDB Connected ✔️");

    app.listen(PORT, () => {
      log(`Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Server startup error ❌", error);
    process.exit(1);
  }
};

startServer();
