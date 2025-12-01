import axiosClient from "./axiosClient";

/**
 * Get ride options (BIKE, AUTO, CAR) for a given distance
 */
export const getRideOptions = (distance: number) => {
  return axiosClient.get(`/booking/options?distance=${distance}`);
};

/**
 * Create a booking
 */
export const createBooking = (bookingData: {
  pickupLocation: string;
  dropLocation: string;
  distanceKm: number;
  vehicleType: string;
  fare: number;
  estimatedTimeMin: number;
}) => {
  return axiosClient.post("/booking/book", bookingData);
};

/**
 * Get a specific booking
 */
export const getBookingById = (bookingId: string) => {
  return axiosClient.get(`/booking/${bookingId}`);
};

/**
 * Get user's booking history
 */
export const getBookingHistory = () => {
  return axiosClient.get("/booking");
};

