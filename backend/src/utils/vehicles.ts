// Vehicle pricing and timing configuration
export const vehicles = {
  BIKE: { farePerKm: 5, timePerKm: 5 },
  AUTO: { farePerKm: 8, timePerKm: 7 },
  CAR: { farePerKm: 12, timePerKm: 10 }
};

export const calculateFareAndTime = (vehicleType: string, distanceKm: number) => {
  const vehicle = vehicles[vehicleType as keyof typeof vehicles];
  if (!vehicle) {
    throw new Error(`Invalid vehicle type: ${vehicleType}`);
  }

  const fare = Math.ceil(distanceKm * vehicle.farePerKm);
  const estimatedTimeMin = Math.ceil(distanceKm * vehicle.timePerKm);

  return { fare, estimatedTimeMin };
};
