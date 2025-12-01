import axiosClient from "./axiosClient";

export const createBooking = (bookingData: {
  pickup: { address: string; coords: { lat: number; lng: number } };
  drop: { address: string; coords: { lat: number; lng: number } };
  rideType: string;
  paymentMethod?: string;
}) => {
  return axiosClient.post("/booking/create", bookingData);
};

export const getBookingById = (bookingId: string) => {
  return axiosClient.get(`/booking/${bookingId}`);
};

export const getBookingHistory = () => {
  return axiosClient.get("/booking");
};

export const cancelBooking = (bookingId: string) => {
  return axiosClient.patch(`/booking/${bookingId}/cancel`);
};
