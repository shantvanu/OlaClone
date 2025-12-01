import axiosClient from "./axiosClient";

/**
 * Get pending rides for the driver matching their vehicle type
 * @param vehicleType BIKE, AUTO, or CAR
 */
export const getPendingRides = (vehicleType: string) => {
  return axiosClient.get("/driver/rides", { params: { vehicleType } });
};

/**
 * Accept a ride booking
 */
export const acceptRide = (bookingId: string) => {
  return axiosClient.post("/driver/accept", { bookingId });
};

/**
 * Get driver's total earnings
 */
export const getDriverEarnings = () => {
  return axiosClient.get("/driver/earnings");
};
