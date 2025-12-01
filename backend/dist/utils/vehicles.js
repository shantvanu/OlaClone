"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFareAndTime = exports.vehicles = void 0;
// Vehicle pricing and timing configuration
exports.vehicles = {
    BIKE: { farePerKm: 5, timePerKm: 5 },
    AUTO: { farePerKm: 8, timePerKm: 7 },
    CAR: { farePerKm: 12, timePerKm: 10 }
};
const calculateFareAndTime = (vehicleType, distanceKm) => {
    const vehicle = exports.vehicles[vehicleType];
    if (!vehicle) {
        throw new Error(`Invalid vehicle type: ${vehicleType}`);
    }
    const fare = Math.ceil(distanceKm * vehicle.farePerKm);
    const estimatedTimeMin = Math.ceil(distanceKm * vehicle.timePerKm);
    return { fare, estimatedTimeMin };
};
exports.calculateFareAndTime = calculateFareAndTime;
