// src/controllers/driver.controller.ts
import { Request, Response } from "express";
import { driverLocationService } from "../services/driverLocation.service";
import Driver from "../models/Driver";
import Booking from "../models/Booking";
import mongoose from "mongoose";
import { log } from "../utils/logger";

/** Register Driver */
export const registerDriver = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const { name, phone, vehicleType } = req.body;

    if (!name || !phone || !vehicleType)
      return res.status(400).json({ msg: "name, phone, vehicleType required" });

    const driver = await Driver.create({
      name,
      phone,
      vehicleType,
      userId,
      status: "available",
      location: {
        type: "Point",
        coordinates: [0, 0]
      }
    });

    return res.json({ ok: true, driver });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Server error" });
  }
};


/** Dev test */
export const testDriver = (req: Request, res: Response) => {
  res.json({ ok: true, msg: "driver route works" });
};

export const updateLocation = async (req: Request, res: Response) => {
  const { driverId, coords } = req.body;

  if (!driverId || !coords)
    return res.status(400).json({ msg: "driverId & coords required" });

  const driver = await driverLocationService.updateLocation(driverId, coords);

  return res.json({ ok: true, driver });
};


export const getNearby = async (req: Request, res: Response) => {
  const { lat, lng, vehicleType } = req.query;
  if (!lat || !lng || !vehicleType) return res.status(400).json({ msg: "lat,lng,vehicleType required" });
  const drivers = await driverLocationService.getNearbyDrivers({ lat: Number(lat), lng: Number(lng) }, String(vehicleType));
  return res.json({ ok: true, drivers });
};

export const seedDrivers = async (req: Request, res: Response) => {
  const sample = [
    { name: "Rohan", phone: "9000000001", vehicleType: "bike", location: { type: "Point", coordinates: [72.83, 21.17] } },
    { name: "Rahul", phone: "9000000002", vehicleType: "mini", location: { type: "Point", coordinates: [72.82, 21.16] } },
    { name: "Amit", phone: "9000000003", vehicleType: "auto", location: { type: "Point", coordinates: [72.84, 21.18] } }
  ];
  const docs = await Driver.insertMany(sample);
  return res.json({ ok: true, inserted: docs.length, docs });
};

/** Driver accepts assignment */
export const acceptAssignment = async (req: Request, res: Response) => {
  const { driverId, bookingId } = req.body;
  if (!driverId || !bookingId) return res.status(400).json({ msg: "driverId & bookingId required" });

  // ensure driver has this booking assigned
  const driver = await Driver.findOne({ _id: driverId, assignedBookingId: bookingId });
  if (!driver) return res.status(400).json({ msg: "No such assigned booking for this driver" });

  // mark accepted
  driver.status = "accepted";
  await driver.save();

  await Booking.findByIdAndUpdate(bookingId, { $set: { status: "accepted" }, $push: { logs: { ts: new Date(), text: "Driver accepted booking" } } });

  return res.json({ ok: true, driver });
};

/** Driver declines assignment */
export const declineAssignment = async (req: Request, res: Response) => {
  const { driverId, bookingId } = req.body;
  if (!driverId || !bookingId) return res.status(400).json({ msg: "driverId & bookingId required" });

  // ensure driver has this booking assigned
  const driver = await Driver.findOne({ _id: driverId, assignedBookingId: bookingId });
  if (!driver) return res.status(400).json({ msg: "No such assigned booking for this driver" });

  // free driver, mark booking as pending again (or try to reassign)
  driver.status = "available";
  driver.assignedBookingId = null;
  driver.lastAssignedAt = null;
  await driver.save();

  await Booking.findByIdAndUpdate(bookingId, { $set: { status: "pending_assignment", driverId: null }, $push: { logs: { ts: new Date(), text: "Driver declined assignment" } } });

  // try to reassign in background
  (async () => {
    try {
      const assignmentService = require("../services/assignment.service").assignmentService;
      await assignmentService.tryAssignDriver(bookingId, (await Booking.findById(bookingId)).pickup.coords, (await Booking.findById(bookingId)).rideType);
    } catch (e) {
      log("Reassign attempt failed", e);
    }
  })();

  return res.json({ ok: true });
};

/** Driver starts ride (driver hits start) */
export const startRide = async (req: Request, res: Response) => {
  const { driverId, bookingId } = req.body;
  if (!driverId || !bookingId) return res.status(400).json({ msg: "driverId & bookingId required" });

  const driver = await Driver.findById(driverId);
  const booking = await Booking.findById(bookingId);
  if (!driver || !booking) return res.status(404).json({ msg: "Not found" });
  if (String(driver.assignedBookingId) !== String(booking._id)) return res.status(400).json({ msg: "Driver not assigned to this booking" });

  driver.status = "busy";
  await driver.save();

  booking.status = "running";
  booking.logs.push({ ts: new Date(), text: "Driver started the ride" });
  await booking.save();

  return res.json({ ok: true, booking, driver });
};

/** Driver completes ride */
export const completeRide = async (req: Request, res: Response) => {
  const { driverId, bookingId } = req.body;
  if (!driverId || !bookingId) return res.status(400).json({ msg: "driverId & bookingId required" });

  const driver = await Driver.findById(driverId);
  const booking = await Booking.findById(bookingId);
  if (!driver || !booking) return res.status(404).json({ msg: "Not found" });

  // mark booking complete
  booking.status = "completed";
  booking.logs.push({ ts: new Date(), text: "Driver completed the ride" });
  await booking.save();

  // free driver
  driver.status = "available";
  driver.assignedBookingId = null;
  driver.lastAssignedAt = null;
  await driver.save();

  return res.json({ ok: true, booking, driver });
};

/** Get driver's current booking */
export const getDriverCurrentBooking = async (req: Request, res: Response) => {
  const { driverId } = req.query;
  if (!driverId) return res.status(400).json({ msg: "driverId required" });
  const booking = await Booking.findOne({ driverId: new mongoose.Types.ObjectId(String(driverId)), status: { $in: ["assigned","accepted","running"] } }).sort({ createdAt: -1 });
  return res.json({ ok: true, booking });
};
