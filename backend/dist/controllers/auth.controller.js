"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginDriver = exports.registerDriver = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Driver_1 = __importDefault(require("../models/Driver"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";
/**
 * POST /auth/register
 * User registration
 */
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ msg: "All fields required" });
        const existing = await User_1.default.findOne({ email });
        if (existing)
            return res.status(400).json({ msg: "Email already registered" });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.default.create({ name, email, password: hashed });
        return res.json({ ok: true, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (err) {
        (0, logger_1.log)("register error", err);
        return res.status(500).json({ msg: "Server error" });
    }
};
exports.register = register;
/**
 * POST /auth/login
 * User login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ msg: "Invalid credentials" });
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match)
            return res.status(400).json({ msg: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
        return res.json({
            ok: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: "user" }
        });
    }
    catch (err) {
        (0, logger_1.log)("login error", err);
        return res.status(500).json({ msg: "Server error" });
    }
};
exports.login = login;
/**
 * POST /auth/driver/register
 * Driver registration
 */
const registerDriver = async (req, res) => {
    try {
        const { name, email, password, vehicleType } = req.body;
        if (!name || !email || !password || !vehicleType) {
            return res.status(400).json({ msg: "name, email, password, vehicleType required" });
        }
        if (!["BIKE", "AUTO", "CAR"].includes(vehicleType)) {
            return res.status(400).json({ msg: "vehicleType must be BIKE, AUTO, or CAR" });
        }
        const existing = await Driver_1.default.findOne({ email });
        if (existing) {
            return res.status(400).json({ msg: "Email already registered" });
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const driver = await Driver_1.default.create({
            name,
            email,
            password: hashed,
            vehicleType,
            walletBalance: 0
        });
        (0, logger_1.log)(`Driver registered: ${driver._id} with vehicle type ${vehicleType}`);
        return res.json({
            ok: true,
            driver: { id: driver._id, name: driver.name, email: driver.email, vehicleType: driver.vehicleType }
        });
    }
    catch (err) {
        (0, logger_1.log)("registerDriver error", err);
        return res.status(500).json({ msg: "Server error" });
    }
};
exports.registerDriver = registerDriver;
/**
 * POST /auth/driver/login
 * Driver login
 */
const loginDriver = async (req, res) => {
    try {
        const { email, password } = req.body;
        const driver = await Driver_1.default.findOne({ email });
        if (!driver)
            return res.status(400).json({ msg: "Invalid credentials" });
        const match = await bcryptjs_1.default.compare(password, driver.password);
        if (!match)
            return res.status(400).json({ msg: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ userId: driver._id, role: "driver" }, JWT_SECRET, { expiresIn: "7d" });
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
    }
    catch (err) {
        (0, logger_1.log)("loginDriver error", err);
        return res.status(500).json({ msg: "Server error" });
    }
};
exports.loginDriver = loginDriver;
