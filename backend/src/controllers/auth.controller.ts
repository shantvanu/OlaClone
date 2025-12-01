import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Driver from "../models/Driver";
import dotenv from "dotenv";
import { log } from "../utils/logger";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

/**
 * POST /auth/register
 * User registration
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ msg: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashed });

    return res.json({ ok: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    log("register error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

/**
 * POST /auth/login
 * User login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: "user" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: "user" }
    });
  } catch (err) {
    log("login error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

/**
 * POST /auth/driver/register
 * Driver registration
 */
export const registerDriver = async (req: Request, res: Response) => {
  try {
    const { name, email, password, vehicleType } = req.body;

    if (!name || !email || !password || !vehicleType) {
      return res.status(400).json({ msg: "name, email, password, vehicleType required" });
    }

    if (!["BIKE", "AUTO", "CAR"].includes(vehicleType)) {
      return res.status(400).json({ msg: "vehicleType must be BIKE, AUTO, or CAR" });
    }

    const existing = await Driver.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const driver = await Driver.create({
      name,
      email,
      password: hashed,
      vehicleType,
      walletBalance: 0
    });

    log(`Driver registered: ${driver._id} with vehicle type ${vehicleType}`);

    return res.json({
      ok: true,
      driver: { id: driver._id, name: driver.name, email: driver.email, vehicleType: driver.vehicleType }
    });
  } catch (err) {
    log("registerDriver error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

/**
 * POST /auth/driver/login
 * Driver login
 */
export const loginDriver = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, driver.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { userId: driver._id, role: "driver" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      ok: true,
      token,
      user: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        role: "driver",
        vehicleType: driver.vehicleType
      }
    });
  } catch (err) {
    log("loginDriver error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
