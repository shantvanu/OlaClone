// src/services/driverLocation.service.ts
import Driver from "../models/Driver";
import mongoose from "mongoose";

export const driverLocationService = {
  async updateLocation(driverId: string, coords: { lat: number; lng: number }) {
    const [lng, lat] = [coords.lng, coords.lat];
    const driver = await Driver.findByIdAndUpdate(driverId, { $set: { location: { type: "Point", coordinates: [lng, lat] }, lastSeen: new Date() } }, { new: true });
    return driver;
  },

  async getNearbyDrivers(coords: { lat: number; lng: number }, vehicleType: string, radiusMeters = 2000) {
    const [lng, lat] = [coords.lng, coords.lat];
    const drivers = await Driver.find({
      vehicleType,
      status: "available",
      location: { $nearSphere: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: radiusMeters } }
    }).limit(20);
    return drivers;
  }
};
