"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverEarnings = exports.acceptRide = exports.getPendingRides = void 0;
const Booking_1 = __importDefault(require("../models/Booking"));
const Driver_1 = __importDefault(require("../models/Driver"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
/**
 * GET /api/driver/rides?vehicleType=CAR
 * Get pending rides matching driver's vehicle type
 */
const getPendingRides = async (req, res) => {
    try {
        const driverId = req.userId; // Driver is authenticated, userId is actually driverId
        const { vehicleType } = req.query;
        if (!driverId || !vehicleType) {
            return res.status(400).json({ msg: "driverId and vehicleType required" });
        }
        // Verify driver exists and vehicle type matches
        const driver = await Driver_1.default.findById(driverId);
        if (!driver) {
            return res.status(404).json({ msg: "Driver not found" });
        }
        if (driver.vehicleType !== vehicleType) {
            return res.status(400).json({ msg: "Vehicle type mismatch" });
        }
        // Get PENDING bookings matching this vehicle type (excluding those already accepted by other drivers)
        const rides = await Booking_1.default.find({
            vehicleType,
            status: "PENDING",
            driverId: null
        })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        return res.json({ ok: true, rides });
    }
    catch (err) {
        (0, logger_1.log)("getPendingRides error", err);
        return res.status(500).json({ msg: "Server error" });
    }
};
exports.getPendingRides = getPendingRides;
/**
 * POST /api/driver/accept
 * Driver accepts a booking
 * Auto-completes after 5 seconds
 */
const acceptRide = async (req, res) => {
    try {
        const driverId = req.userId; // Driver is authenticated
        const { bookingId } = req.body;
        if (!bookingId) {
            return res.status(400).json({ msg: "bookingId required" });
        }
        // Verify driver exists
        const driver = await Driver_1.default.findById(driverId);
        if (!driver) {
            return res.status(404).json({ msg: "Driver not found" });
        }
        // Verify booking exists and is PENDING
        const booking = await Booking_1.default.findById(bookingId);
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
        booking.driverId = new mongoose_1.default.Types.ObjectId(driverId);
        booking.status = "ACCEPTED";
        await booking.save();
        (0, logger_1.log)(`Booking ${bookingId} accepted by driver ${driverId}`);
        // Auto-complete after 5 seconds
        setTimeout(async () => {
            try {
                const updatedBooking = await Booking_1.default.findById(bookingId);
                if (updatedBooking && updatedBooking.status === "ACCEPTED") {
                    updatedBooking.status = "COMPLETED";
                    await updatedBooking.save();
                    // Update driver wallet
                    const updatedDriver = await Driver_1.default.findById(driverId);
                    if (updatedDriver) {
                        updatedDriver.walletBalance += booking.fare;
                        await updatedDriver.save();
                        (0, logger_1.log)(`Booking ${bookingId} completed. Driver ${driverId} earned ₹${booking.fare}`);
                    }
                }
            }
            catch (err) {
                (0, logger_1.log)("Auto-completion error", err);
            }
        }, 5000);
        return res.json({
            ok: true,
            message: "Ride accepted. Will be completed in 5 seconds.",
            booking: {
                bookingId: booking._id,
                status: booking.status,
                fare: booking.fare
            }
        });
    }
    catch (err) {
        (0, logger_1.log)("acceptRide error", err);
        return res.status(500).json({ msg: "Server error" });
    }
};
exports.acceptRide = acceptRide;
/**
 * GET /api/driver/earnings
 * Get driver's total earnings
 */
const getDriverEarnings = async (req, res) => {
    try {
        const driverId = req.userId;
        const driver = await Driver_1.default.findById(driverId);
        if (!driver) {
            return res.status(404).json({ msg: "Driver not found" });
        }
        return res.json({
            ok: true,
            earnings: driver.walletBalance
        });
    }
    catch (err) {
        (0, logger_1.log)("getDriverEarnings error", err);
        return res.status(500).json({ msg: "Server error" });
    }
};
exports.getDriverEarnings = getDriverEarnings;
