"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverLocationService = void 0;
// src/services/driverLocation.service.ts
const Driver_1 = __importDefault(require("../models/Driver"));
exports.driverLocationService = {
    async updateLocation(driverId, coords) {
        const [lng, lat] = [coords.lng, coords.lat];
        const driver = await Driver_1.default.findByIdAndUpdate(driverId, { $set: { location: { type: "Point", coordinates: [lng, lat] }, lastSeen: new Date() } }, { new: true });
        return driver;
    },
    async getNearbyDrivers(coords, vehicleType, radiusMeters = 2000) {
        const [lng, lat] = [coords.lng, coords.lat];
        const drivers = await Driver_1.default.find({
            vehicleType,
            status: "available",
            location: { $nearSphere: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: radiusMeters } }
        }).limit(20);
        return drivers;
    }
};
