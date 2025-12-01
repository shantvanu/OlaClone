// src/utils/constants.ts
export const RIDE_TYPES = ["bike", "auto", "mini", "sedan"] as const;
export type RideType = typeof RIDE_TYPES[number];

export const FARE_RATES: Record<RideType, { base: number; perKm: number; perMinute: number }> = {
  bike: { base: 15, perKm: 7, perMinute: 0.5 },
  auto: { base: 25, perKm: 10, perMinute: 0.6 },
  mini: { base: 40, perKm: 14, perMinute: 0.8 },
  sedan: { base: 60, perKm: 18, perMinute: 1 }
};

export const ASSIGN_TIMEOUT_MS = 90 * 1000; // 90 seconds for driver to accept
export const ASSIGN_SEARCH_RADIUS_METERS = 5000; // 5 km
