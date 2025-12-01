"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fareService = void 0;
// src/services/fare.service.ts
const constants_1 = require("../utils/constants");
exports.fareService = {
    calculateFare(distanceKm, durationMinutes, rideType) {
        const rates = constants_1.FARE_RATES[rideType];
        const distanceFare = Math.round(rates.perKm * distanceKm);
        const timeFare = Math.round(rates.perMinute * durationMinutes);
        const subtotal = rates.base + distanceFare + timeFare;
        const bookingFee = 5;
        const tax = Math.round(subtotal * 0.05);
        const total = Math.round(subtotal + bookingFee + tax);
        return {
            base: rates.base,
            distanceFare,
            timeFare,
            bookingFee,
            tax,
            total
        };
    }
};
