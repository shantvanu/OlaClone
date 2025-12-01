// src/routes/driver.routes.ts
import { Router } from "express";
import {
  getPendingRides,
  acceptRide,
  getDriverEarnings
} from "../controllers/driver.controller";

const router = Router();

// Get pending rides for driver matching their vehicle type
router.get("/rides", getPendingRides);

// Accept a ride
router.post("/accept", acceptRide);

// Get driver's earnings
router.get("/earnings", getDriverEarnings);

export default router;
