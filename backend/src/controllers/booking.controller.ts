// src/controllers/booking.controller.ts
import { Request, Response } from "express";
import Booking from "../models/Booking";
import Driver from "../models/Driver";
import { fareService } from "../services/fare.service";
import { assignmentService } from "../services/assignment.service";
import mongoose from "mongoose";
import { haversineDistanceKm } from "../utils/geo";
import { log } from "../utils/logger";

/** Create booking */
export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // ✅ coming from JWT

    const { pickup, drop, rideType, scheduleFor, paymentMethod } = req.body;
    if (!pickup || !drop || !rideType)
      return res.status(400).json({ msg: "Missing required fields" });

    if (!pickup.coords || !drop.coords)
      return res.status(400).json({ msg: "pickup.coords and drop.coords required" });

    if (typeof pickup.coords.lat !== "number" || typeof pickup.coords.lng !== "number")
      return res.status(400).json({ msg: "Invalid pickup coords" });

    // Distance & time calculations
    const distKm = haversineDistanceKm(
      pickup.coords.lat,
      pickup.coords.lng,
      drop.coords.lat,
      drop.coords.lng
    );

    const durationMin = Math.max(1, Math.round((distKm / 30) * 60));
    const fareBreakdown = fareService.calculateFare(distKm, durationMin, rideType);

    // Save booking
    const booking = await Booking.create({
      userId: new mongoose.Types.ObjectId(userId),
      pickup,
      drop,
      distanceKm: Number(distKm.toFixed(2)),
      durationText: `${durationMin} mins`,
      rideType,
      fareBreakdown,
      payment: { method: paymentMethod || "cash", status: "pending" },
      status: scheduleFor ? "scheduled" : "pending_assignment",
      scheduledFor: scheduleFor ? new Date(scheduleFor) : null,
      logs: [
        {
          ts: new Date(),
          text: scheduleFor
            ? "Scheduled booking created"
            : "Booking created - pending assignment",
        },
      ],
    });

    // If not scheduled → try assigning driver immediately
    if (!scheduleFor) {
      const assignedDriver = await assignmentService.tryAssignDriver(
        booking._id,
        pickup.coords,
        rideType
      );

      return res.json({
        ok: true,
        booking,
        assignedDriver: assignedDriver || null,
      });
    }

    return res.json({ ok: true, booking, msg: "Scheduled booking saved" });
  } catch (err) {
    log("createBooking error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  if (!bookingId) return res.status(400).json({ msg: "bookingId required" });

  const booking = await Booking.findById(bookingId).populate("driverId userId");
  if (!booking) return res.status(404).json({ msg: "Booking not found" });

  return res.json({ ok: true, booking });
};

// ⭐ Updated getHistory → userId comes from token
export const getBookingHistory = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(400).json({ msg: "Missing userId" });

  const list = await Booking.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return res.json({ ok: true, bookings: list });
};

export const updateDestination = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { newDrop, distanceKm, durationText } = req.body;

    if (!bookingId || !newDrop)
      return res.status(400).json({ msg: "bookingId and newDrop required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (!["running", "assigned", "accepted"].includes(booking.status))
      return res
        .status(400)
        .json({ msg: "Cannot update destination for this booking status" });

    const distKm =
      distanceKm ??
      haversineDistanceKm(
        booking.pickup.coords.lat,
        booking.pickup.coords.lng,
        newDrop.coords.lat,
        newDrop.coords.lng
      );

    const durationMin = Math.max(1, Math.round((distKm / 30) * 60));
    const newFare = fareService.calculateFare(
      distKm,
      durationMin,
      booking.rideType as any
    );

    booking.drop = newDrop;
    booking.distanceKm = Number(distKm.toFixed(2));
    booking.durationText = `${durationMin} mins`;
    booking.fareBreakdown = newFare;
    booking.lastDropUpdateAt = new Date();
    booking.logs.push({ ts: new Date(), text: "Destination updated by user" });

    await booking.save();

    return res.json({ ok: true, booking });
  } catch (err) {
    log("updateDestination error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const completeBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.status = "completed";
    booking.logs.push({ ts: new Date(), text: "Booking completed" });
    await booking.save();

    if (booking.driverId) {
      await Driver.findByIdAndUpdate(booking.driverId, {
        $set: {
          status: "available",
          assignedBookingId: null,
          lastAssignedAt: null,
        },
      });
    }

    return res.json({ ok: true, booking });
  } catch (err) {
    log("completeBooking error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.status = "cancelled";
    booking.logs.push({ ts: new Date(), text: "Booking cancelled by user" });
    await booking.save();

    if (booking.driverId) {
      await Driver.findByIdAndUpdate(booking.driverId, {
        $set: {
          status: "available",
          assignedBookingId: null,
          lastAssignedAt: null,
        },
      });
    }

    return res.json({ ok: true, booking });
  } catch (err) {
    log("cancelBooking error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
