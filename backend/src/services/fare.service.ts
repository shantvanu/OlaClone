// src/services/fare.service.ts
import { FARE_RATES } from "../utils/constants";

export const fareService = {
  calculateFare(distanceKm: number, durationMinutes: number, rideType: keyof typeof FARE_RATES) {
    const rates = FARE_RATES[rideType];
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
