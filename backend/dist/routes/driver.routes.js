"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/driver.routes.ts
const express_1 = require("express");
const driver_controller_1 = require("../controllers/driver.controller");
const router = (0, express_1.Router)();
// Get pending rides for driver matching their vehicle type
router.get("/rides", driver_controller_1.getPendingRides);
// Accept a ride
router.post("/accept", driver_controller_1.acceptRide);
// Get driver's earnings
router.get("/earnings", driver_controller_1.getDriverEarnings);
exports.default = router;
