// src/routes/booking.routes.ts
import { Router } from "express";
import {
  createBooking,
  getBookingById,
  getBookingHistory,
  updateDestination,
  completeBooking,
  cancelBooking
} from "../controllers/booking.controller";

const router = Router();

// ---------- SPECIFIC ROUTES FIRST ----------
router.patch("/update-destination/:bookingId", updateDestination);
router.patch("/complete/:bookingId", completeBooking);
router.patch("/cancel/:bookingId", cancelBooking);

// ---------- GENERAL ROUTES ----------
router.get("/", getBookingHistory);
router.get("/:bookingId", getBookingById);

// ---------- CREATE BOOKING ----------
router.post("/create", createBooking);

export default router;
