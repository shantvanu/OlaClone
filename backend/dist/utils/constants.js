"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSIGN_SEARCH_RADIUS_METERS = exports.ASSIGN_TIMEOUT_MS = exports.FARE_RATES = exports.RIDE_TYPES = void 0;
// src/utils/constants.ts
exports.RIDE_TYPES = ["bike", "auto", "mini", "sedan"];
exports.FARE_RATES = {
    bike: { base: 15, perKm: 7, perMinute: 0.5 },
    auto: { base: 25, perKm: 10, perMinute: 0.6 },
    mini: { base: 40, perKm: 14, perMinute: 0.8 },
    sedan: { base: 60, perKm: 18, perMinute: 1 }
};
exports.ASSIGN_TIMEOUT_MS = 90 * 1000; // 90 seconds for driver to accept
exports.ASSIGN_SEARCH_RADIUS_METERS = 5000; // 5 km
