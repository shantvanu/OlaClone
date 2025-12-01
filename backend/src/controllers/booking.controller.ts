// src/controllers/booking.controller.ts
import { Request, Response } from "express";
import Booking from "../models/Booking";
import Driver from "../models/Driver";
import { haversineDistanceKm } from "../utils/geo";
import { calculateFareAndTime } from "../utils/vehicles";
import mongoose from "mongoose";
import { log } from "../utils/logger";

/**
 * GET /api/ride/options?distance=X
 * Returns ride options (BIKE, AUTO, CAR) with fare and time
 */
export const getRideOptions = async (req: Request, res: Response) => {
  try {
    const { distance } = req.query;
    if (!distance) {
      return res.status(400).json({ msg: "distance query parameter required" });
    }

    const distanceKm = parseFloat(distance as string);
    if (isNaN(distanceKm) || distanceKm <= 0) {
      return res.status(400).json({ msg: "distance must be a positive number" });
    }

    const options = [
      {
        vehicleType: "BIKE",
        ...calculateFareAndTime("BIKE", distanceKm)
      },
      {
        vehicleType: "AUTO",
        ...calculateFareAndTime("AUTO", distanceKm)
      },
      {
        vehicleType: "CAR",
        ...calculateFareAndTime("CAR", distanceKm)
      }
    ];

    return res.json({ ok: true, options });
  } catch (err) {
    log("getRideOptions error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

/**
 * POST /api/ride/book
 * Creates a booking
 */
export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      pickupLocation,
      dropLocation,
      distanceKm,
      vehicleType,
      fare,
      estimatedTimeMin
    } = req.body;

    // Validate required fields
    if (
      !pickupLocation ||
      !dropLocation ||
      typeof distanceKm !== "number" ||
      !vehicleType ||
      typeof fare !== "number" ||
      typeof estimatedTimeMin !== "number"
    ) {
      return res.status(400).json({
        msg: "Missing or invalid required fields: pickupLocation, dropLocation, distanceKm, vehicleType, fare, estimatedTimeMin"
      });
    }

    // Validate vehicle type
    if (!["BIKE", "AUTO", "CAR"].includes(vehicleType)) {
      return res.status(400).json({ msg: "Invalid vehicleType. Must be BIKE, AUTO, or CAR" });
    }

    // Create booking
    const booking = await Booking.create({
      userId: new mongoose.Types.ObjectId(userId),
      pickupLocation,
      dropLocation,
      distanceKm,
      vehicleType,
      fare,
      estimatedTimeMin,
      status: "PENDING"
    });

    log(`Booking created: ${booking._id} for user ${userId}`);

    return res.json({
      ok: true,
      booking: {
        bookingId: booking._id,
        status: booking.status,
        fare: booking.fare,
        estimatedTimeMin: booking.estimatedTimeMin
      }
    });
  } catch (err) {
    log("createBooking error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET /api/ride/:bookingId
 * Get booking details
 */
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ msg: "bookingId required" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("userId", "name email")
      .populate("driverId", "name email vehicleType");

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    return res.json({ ok: true, booking });
  } catch (err) {
    log("getBookingById error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET /api/ride/history
 * Get user's booking history
 */
export const getBookingHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(400).json({ msg: "Missing userId" });
    }

    const bookings = await Booking.find({
      userId: new mongoose.Types.ObjectId(userId)
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("driverId", "name email vehicleType");

    return res.json({ ok: true, bookings });
  } catch (err) {
    log("getBookingHistory error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
