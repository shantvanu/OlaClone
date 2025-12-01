// src/services/assignment.service.ts
import Driver from "../models/Driver";
import Booking from "../models/Booking";
import mongoose from "mongoose";
import { log } from "../utils/logger";
import { ASSIGN_SEARCH_RADIUS_METERS } from "../utils/constants";

/**
 * Attempt to find and atomically claim a nearby available driver for given rideType & pickup
 * Returns assigned driver doc or null
 */

export const assignmentService = {
  async tryAssignDriver(bookingId: mongoose.Types.ObjectId, pickupCoords: { lat: number; lng: number }, rideType: string) {
    const [lng, lat] = [pickupCoords.lng, pickupCoords.lat];

    const candidates = await Driver.find({
      vehicleType: rideType,
      status: "available",
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: ASSIGN_SEARCH_RADIUS_METERS
        }
      }
    }).limit(10);

    for (const d of candidates) {
      try {
        const assigned = await Driver.findOneAndUpdate(
          { _id: d._id, status: "available" },
          { $set: { status: "assigned", assignedBookingId: bookingId, lastAssignedAt: new Date() } },
          { new: true }
        );
        if (assigned) {
          await Booking.findByIdAndUpdate(bookingId, {
            $set: { driverId: assigned._id, status: "assigned" },
            $push: { logs: { ts: new Date(), text: `Driver ${assigned._id} assigned` } }
          });
          log("Assigned driver", assigned._id.toString(), "to booking", bookingId.toString());
          return assigned;
        }
      } catch (err) {
        log("assignment try error", err);
      }
    }

    await Booking.findByIdAndUpdate(bookingId, { $set: { status: "unassigned" }, $push: { logs: { ts: new Date(), text: "No driver found" } } });
    return null;
  },

  async freeStaleAssignedDrivers(timeoutMs = 90 * 1000) {
    const cutoff = new Date(Date.now() - timeoutMs);
    const res = await Driver.updateMany(
      { status: "assigned", lastAssignedAt: { $lt: cutoff } },
      { $set: { status: "available", assignedBookingId: null, lastAssignedAt: null } }
    );
    log("Freed stale drivers count:", res.modifiedCount);
    return res.modifiedCount;
  }
};
