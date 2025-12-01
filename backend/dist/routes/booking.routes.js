"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/booking.routes.ts
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const router = (0, express_1.Router)();
// Get ride options (BIKE, AUTO, CAR with fare and time)
router.get("/options", booking_controller_1.getRideOptions);
// Create a booking
router.post("/book", booking_controller_1.createBooking);
// Get booking by ID
router.get("/:bookingId", booking_controller_1.getBookingById);
// Get user's booking history
router.get("/", booking_controller_1.getBookingHistory);
exports.default = router;
