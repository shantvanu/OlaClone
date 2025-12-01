"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingHistory = exports.getBookingById = exports.createBooking = exports.getRideOptions = void 0;
const Booking_1 = __importDefault(require("../models/Booking"));
const vehicles_1 = require("../utils/vehicles");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
/**
 * GET /api/ride/options?distance=X
 * Returns ride options (BIKE, AUTO, CAR) with fare and time
 */
const getRideOptions = async (req, res) => {
    try {
        const { distance } = req.query;
        if (!distance) {
            return res.status(400).json({ msg: "distance query parameter required" });
        }
        const distanceKm = parseFloat(distance);
        if (isNaN(distanceKm) || distanceKm <= 0) {
            return res.status(400).json({ msg: "distance must be a positive number" });
        }
        const options = [
            {
                vehicleType: "BIKE",
                ...(0, vehicles_1.calculateFareAndTime)("BIKE", distanceKm)
            },
            {
                vehicleType: "AUTO",
                ...(0, vehicles_1.calculateFareAndTime)("AUTO", distanceKm)
            },
            {
                vehicleType: "CAR",
                ...(0, vehicles_1.calculateFareAndTime)("CAR", distanceKm)
            }
        ];
        return res.json({ ok: true, options });
    }
    catch (err) {
        (0, logger_1.log)("getRideOptions error", err);
        return res.status(500).json({ msg: "Server error" });
    }
};
exports.getRideOptions = getRideOptions;
/**
 * POST /api/ride/book
 * Creates a booking
 */
const createBooking = async (req, res) => {
    try {
        const userId = req.userId;
        const { pickupLocation, dropLocation, distanceKm, vehicleType, fare, estimatedTimeMin } = req.body;
        // Validate required fields
        if (!pickupLocation ||
            !dropLocation ||
            typeof distanceKm !== "number" ||
            !vehicleType ||
            typeof fare !== "number" ||
            typeof estimatedTimeMin !== "number") {
            return res.status(400).json({
                msg: "Missing or invalid required fields: pickupLocation, dropLocation, distanceKm, vehicleType, fare, estimatedTimeMin"
            });
        }
        // Validate vehicle type
        if (!["BIKE", "AUTO", "CAR"].includes(vehicleType)) {
            return res.status(400).json({ msg: "Invalid vehicleType. Must be BIKE, AUTO, or CAR" });
        }
        // Create booking
        const booking = await Booking_1.default.create({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            pickupLocation,
            dropLocation,
            distanceKm,
            vehicleType,
            fare,
            estimatedTimeMin,
            status: "PENDING"
        });
        (0, logger_1.log)(`Booking created: ${booking._id} for user ${userId}`);
        return res.json({
            ok: true,
            booking: {
                bookingId: booking._id,
                status: booking.status,
                fare: booking.fare,
                estimatedTimeMin: booking.estimatedTimeMin
            }
        });
    }
    catch (err) {
        (0, logger_1.log)("createBooking error", err);
        return res.status(500).json({ msg: "Server error" });
    }
};
exports.createBooking = createBooking;
/**
 * GET /api/ride/:bookingId
 * Get booking details
 */
const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;
        if (!bookingId) {
            return res.status(400).json({ msg: "bookingId required" });
        }
        const booking = await Booking_1.default.findById(bookingId)
            .populate("userId", "name email")
            .populate("driverId", "name email vehicleType");
        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }
        return res.json({ ok: true, booking });
    }
    catch (err) {
        (0, logger_1.log)("getBookingById error", err);
        return res.status(500).json({ msg: "Server error" });
    }
};
exports.getBookingById = getBookingById;
/**
 * GET /api/ride/history
 * Get user's booking history
 */
const getBookingHistory = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ msg: "Missing userId" });
        }
        const bookings = await Booking_1.default.find({
            userId: new mongoose_1.default.Types.ObjectId(userId)
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("driverId", "name email vehicleType");
        return res.json({ ok: true, bookings });
    }
    catch (err) {
        (0, logger_1.log)("getBookingHistory error", err);
        return res.status(500).json({ msg: "Server error" });
    }
};
exports.getBookingHistory = getBookingHistory;
