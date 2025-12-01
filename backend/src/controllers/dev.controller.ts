import { Request, Response } from "express";
import Driver from "../models/Driver";
import User from "../models/User";

/**
 * Simple dev seed endpoint to quickly create demo users & drivers
 * for local testing as per README spec.
 */
export const seedDevData = async (_req: Request, res: Response) => {
  try {
    // Create a demo user if not exists
    const demoUserEmail = "demo.user@example.com";
    let demoUser = await User.findOne({ email: demoUserEmail });
    if (!demoUser) {
      demoUser = await User.create({
        name: "Demo User",
        email: demoUserEmail,
        password: "password123"
      });
    }

    // Create a few demo drivers near a fixed point
    const center = { lng: 72.8777, lat: 19.0760 }; // Mumbai
    const sampleDrivers = [
      { name: "Rohan", phone: "9000000001", vehicleType: "bike" },
      { name: "Rahul", phone: "9000000002", vehicleType: "auto" },
      { name: "Amit", phone: "9000000003", vehicleType: "car" }
    ];

    const createdDrivers = [];

    for (const d of sampleDrivers) {
      let existing = await Driver.findOne({ phone: d.phone });
      if (!existing) {
        existing = await Driver.create({
          ...d,
          userId: demoUser._id,
          status: "available",
          location: {
            type: "Point",
            coordinates: [
              center.lng + (Math.random() - 0.5) * 0.02,
              center.lat + (Math.random() - 0.5) * 0.02
            ]
          }
        });
      }
      createdDrivers.push(existing);
    }

    return res.json({
      ok: true,
      user: {
        id: demoUser._id,
        email: demoUser.email
      },
      drivers: createdDrivers
    });
  } catch (err) {
    console.error("dev seed error", err);
    return res.status(500).json({ msg: "Seed failed" });
  }
};


