"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentService = void 0;
// src/services/assignment.service.ts
const Driver_1 = __importDefault(require("../models/Driver"));
const Booking_1 = __importDefault(require("../models/Booking"));
const logger_1 = require("../utils/logger");
const constants_1 = require("../utils/constants");
/**
 * Attempt to find and atomically claim a nearby available driver for given rideType & pickup
 * Returns assigned driver doc or null
 */
exports.assignmentService = {
    async tryAssignDriver(bookingId, pickupCoords, rideType) {
        const [lng, lat] = [pickupCoords.lng, pickupCoords.lat];
        const candidates = await Driver_1.default.find({
            vehicleType: rideType,
            status: "available",
            location: {
                $nearSphere: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: constants_1.ASSIGN_SEARCH_RADIUS_METERS
                }
            }
        }).limit(10);
        for (const d of candidates) {
            try {
                const assigned = await Driver_1.default.findOneAndUpdate({ _id: d._id, status: "available" }, { $set: { status: "assigned", assignedBookingId: bookingId, lastAssignedAt: new Date() } }, { new: true });
                if (assigned) {
                    await Booking_1.default.findByIdAndUpdate(bookingId, {
                        $set: { driverId: assigned._id, status: "assigned" },
                        $push: { logs: { ts: new Date(), text: `Driver ${assigned._id} assigned` } }
                    });
                    (0, logger_1.log)("Assigned driver", assigned._id.toString(), "to booking", bookingId.toString());
                    return assigned;
                }
            }
            catch (err) {
                (0, logger_1.log)("assignment try error", err);
            }
        }
        await Booking_1.default.findByIdAndUpdate(bookingId, { $set: { status: "unassigned" }, $push: { logs: { ts: new Date(), text: "No driver found" } } });
        return null;
    },
    async freeStaleAssignedDrivers(timeoutMs = 90 * 1000) {
        const cutoff = new Date(Date.now() - timeoutMs);
        const res = await Driver_1.default.updateMany({ status: "assigned", lastAssignedAt: { $lt: cutoff } }, { $set: { status: "available", assignedBookingId: null, lastAssignedAt: null } });
        (0, logger_1.log)("Freed stale drivers count:", res.modifiedCount);
        return res.modifiedCount;
    }
};
