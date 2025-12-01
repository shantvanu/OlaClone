// src/routes/driver.routes.ts
import { Router } from "express";
import {
  registerDriver,
  testDriver,
  updateLocation,
  getNearby,
  seedDrivers,
  acceptAssignment,
  declineAssignment,
  startRide,
  completeRide,
  getDriverCurrentBooking,
  getDriverStats
} from "../controllers/driver.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Register driver
router.post("/create", authMiddleware, registerDriver);

// Test
router.get("/", testDriver);

// UPDATE DRIVER LOCATION (PATCH)
router.patch("/update-location", authMiddleware, updateLocation);

// Nearby drivers
router.get("/nearby", authMiddleware, getNearby);

// Seed
router.post("/seed", seedDrivers);

// Ride flow
router.post("/accept", authMiddleware, acceptAssignment);
router.post("/decline", authMiddleware, declineAssignment);
router.post("/start", authMiddleware, startRide);
router.post("/complete", authMiddleware, completeRide);

// Driver’s active booking
router.get("/current-booking", authMiddleware, getDriverCurrentBooking);

// Driver stats (earnings, total rides)
router.get("/stats", authMiddleware, getDriverStats);

export default router;
