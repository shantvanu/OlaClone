import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/booking.routes";
import driverRoutes from "./routes/driver.routes";
import paymentRoutes from "./routes/payment.routes";
import { authMiddleware } from "./middleware/auth.middleware";   // <-- FIXED

const app = express();

app.use(cors());
app.use(express.json());

// Public
app.use("/auth", authRoutes);

// Protected
app.use("/booking", authMiddleware, bookingRoutes);
app.use("/driver", authMiddleware, driverRoutes);
app.use("/payment", authMiddleware, paymentRoutes);

export default app;
