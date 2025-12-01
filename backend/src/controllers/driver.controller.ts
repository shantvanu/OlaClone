// src/controllers/driver.controller.ts
import { Request, Response } from "express";
import Booking from "../models/Booking";
import Driver from "../models/Driver";
import mongoose from "mongoose";
import { log } from "../utils/logger";

/**
 * GET /api/driver/rides?vehicleType=CAR
 * Get pending rides matching driver's vehicle type
 */
export const getPendingRides = async (req: Request, res: Response) => {
  try {
    const driverId = (req as any).userId; // Driver is authenticated, userId is actually driverId
    const { vehicleType } = req.query;

    if (!driverId || !vehicleType) {
      return res.status(400).json({ msg: "driverId and vehicleType required" });
    }

    // Verify driver exists and vehicle type matches
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ msg: "Driver not found" });
    }

    if (driver.vehicleType !== vehicleType) {
      return res.status(400).json({ msg: "Vehicle type mismatch" });
    }

    // Get PENDING bookings matching this vehicle type (excluding those already accepted by other drivers)
    const rides = await Booking.find({
      vehicleType,
      status: "PENDING",
      driverId: null
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.json({ ok: true, rides });
  } catch (err) {
    log("getPendingRides error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

/**
 * POST /api/driver/accept
 * Driver accepts a booking
 * Auto-completes after 5 seconds
 */
export const acceptRide = async (req: Request, res: Response) => {
  try {
    const driverId = (req as any).userId; // Driver is authenticated
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ msg: "bookingId required" });
    }

    // Verify driver exists
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ msg: "Driver not found" });
    }

    // Verify booking exists and is PENDING
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ msg: "Booking is not pending" });
    }

    // Verify vehicle type matches
    if (booking.vehicleType !== driver.vehicleType) {
      return res.status(400).json({ msg: "Vehicle type mismatch" });
    }

    // Assign driver to booking
    booking.driverId = new mongoose.Types.ObjectId(driverId);
    booking.status = "ACCEPTED";
    await booking.save();

    log(`Booking ${bookingId} accepted by driver ${driverId}`);

    // Auto-complete after 5 seconds
    setTimeout(async () => {
      try {
        const updatedBooking = await Booking.findById(bookingId);
        if (updatedBooking && updatedBooking.status === "ACCEPTED") {
          updatedBooking.status = "COMPLETED";
          await updatedBooking.save();

          // Update driver wallet
          const updatedDriver = await Driver.findById(driverId);
          if (updatedDriver) {
            updatedDriver.walletBalance += booking.fare;
            await updatedDriver.save();
            log(`Booking ${bookingId} completed. Driver ${driverId} earned ₹${booking.fare}`);
          }
        }
      } catch (err) {
        log("Auto-completion error", err);
      }
    }, 5000);

    return res.json({
      ok: true,
      message: "Ride accepted. Will be completed in 5 seconds.",
      booking: {
        bookingId: booking._id,
        status: booking.status,
        fare: booking.fare
      },
      earnedAmount: booking.fare,
      totalEarnings: driver.walletBalance + booking.fare
    });
  } catch (err) {
    log("acceptRide error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET /api/driver/earnings
 * Get driver's total earnings
 */
export const getDriverEarnings = async (req: Request, res: Response) => {
  try {
    const driverId = (req as any).userId;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ msg: "Driver not found" });
    }

    return res.json({
      ok: true,
      earnings: driver.walletBalance
    });
  } catch (err) {
    log("getDriverEarnings error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
