import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/booking.routes";
import driverRoutes from "./routes/driver.routes";
import devRoutes from "./routes/dev.routes";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();

app.use(cors());
app.use(express.json());

// Public
app.use("/auth", authRoutes);
app.use("/dev", devRoutes);

// Protected
app.use("/booking", authMiddleware, bookingRoutes);
app.use("/driver", authMiddleware, driverRoutes);

export default app;
