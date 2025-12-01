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

      /** ---------------------------------------------
       *  Load Workers (Optimized for assignment demo)
       *  - Scheduler: Handles future scheduled bookings
       *  - Assignment: Auto-frees stale driver assignments
       * --------------------------------------------- */
      try {
        // require dynamically to avoid TS/ESM issues
        require("./workers/scheduler.worker");
        require("./workers/assignment.worker");
        log("✓ Background workers started");
      } catch (e) {
        console.warn("⚠ Worker start failed. Run workers separately if needed.", e);
      }
    });

  } catch (error) {
    console.error("Server startup error ❌", error);
    process.exit(1);
  }
};

startServer();
