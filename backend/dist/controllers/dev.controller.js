"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDevData = void 0;
const Driver_1 = __importDefault(require("../models/Driver"));
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../utils/logger");
/**
 * Simple dev seed endpoint to quickly create demo users & drivers
 */
const seedDevData = async (_req, res) => {
    try {
        // Create a demo user if not exists
        const demoUserEmail = "demo.user@example.com";
        let demoUser = await User_1.default.findOne({ email: demoUserEmail });
        if (!demoUser) {
            const hashed = await bcryptjs_1.default.hash("password123", 10);
            demoUser = await User_1.default.create({
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
        const hashed = await bcryptjs_1.default.hash("password123", 10);
        for (const d of sampleDrivers) {
            let existing = await Driver_1.default.findOne({ email: d.email });
            if (!existing) {
                existing = await Driver_1.default.create({
                    ...d,
                    password: hashed,
                    walletBalance: 0
                });
            }
            createdDrivers.push(existing);
        }
        (0, logger_1.log)("Dev seed completed");
        return res.json({
            ok: true,
            user: {
                id: demoUser._id,
                email: demoUser.email
            },
            drivers: createdDrivers.map((d) => ({
                id: d._id,
                name: d.name,
                email: d.email,
                vehicleType: d.vehicleType
            }))
        });
    }
    catch (err) {
        (0, logger_1.log)("dev seed error", err);
        return res.status(500).json({ msg: "Seed failed" });
    }
};
exports.seedDevData = seedDevData;
