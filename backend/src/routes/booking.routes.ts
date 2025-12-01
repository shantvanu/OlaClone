// src/routes/booking.routes.ts
import { Router } from "express";
import {
  getRideOptions,
  createBooking,
  getBookingById,
  getBookingHistory
} from "../controllers/booking.controller";

const router = Router();

// Get ride options (BIKE, AUTO, CAR with fare and time)
router.get("/options", getRideOptions);

// Create a booking
router.post("/book", createBooking);

// Get booking by ID
router.get("/:bookingId", getBookingById);

// Get user's booking history
router.get("/", getBookingHistory);

export default router;

