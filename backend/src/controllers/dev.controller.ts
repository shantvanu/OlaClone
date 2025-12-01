import { Request, Response } from "express";
import Driver from "../models/Driver";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { log } from "../utils/logger";

/**
 * Simple dev seed endpoint to quickly create demo users & drivers
 */
export const seedDevData = async (_req: Request, res: Response) => {
  try {
    // Create a demo user if not exists
    const demoUserEmail = "demo.user@example.com";
    let demoUser = await User.findOne({ email: demoUserEmail });
    if (!demoUser) {
      const hashed = await bcrypt.hash("password123", 10);
      demoUser = await User.create({
        name: "Demo User",
        email: demoUserEmail,
        password: hashed
      });
    }

    // Create demo drivers
    const sampleDrivers = [
      { name: "Rohan", email: "rohan@example.com", vehicleType: "BIKE" },
      { name: "Rahul", email: "rahul@example.com", vehicleType: "AUTO" },
      { name: "Amit", email: "amit@example.com", vehicleType: "CAR" }
    ];

    const createdDrivers = [];
    const hashed = await bcrypt.hash("password123", 10);

    for (const d of sampleDrivers) {
      let existing = await Driver.findOne({ email: d.email });
      if (!existing) {
        existing = await Driver.create({
          ...d,
          password: hashed,
          walletBalance: 0
        });
      }
      createdDrivers.push(existing);
    }

    log("Dev seed completed");

    return res.json({
      ok: true,
      user: {
        id: demoUser._id,
        email: demoUser.email
      },
      drivers: createdDrivers.map((d: any) => ({
        id: d._id,
        name: d.name,
        email: d.email,
        vehicleType: d.vehicleType
      }))
    });
  } catch (err) {
    log("dev seed error", err);
    return res.status(500).json({ msg: "Seed failed" });
  }
};


