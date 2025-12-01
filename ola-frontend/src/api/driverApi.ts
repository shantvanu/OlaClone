import axiosClient from "./axiosClient";

export const registerDriver = (driverData: any) => {
  return axiosClient.post("/driver/create", driverData);
};

export const getNearbyRequests = (lat: number, lng: number, vehicleType: string) => {
  return axiosClient.get("/driver/nearby", { params: { lat, lng, vehicleType } });
};

export const acceptAssignment = (driverId: string, bookingId: string) => {
  return axiosClient.post("/driver/accept", { driverId, bookingId });
};

export const startRide = (driverId: string, bookingId: string) => {
  return axiosClient.post("/driver/start", { driverId, bookingId });
};

export const completeRide = (driverId: string, bookingId: string) => {
  return axiosClient.post("/driver/complete", { driverId, bookingId });
};

export const updateLocation = (driverId: string, coords: { lat: number, lng: number }) => {
  return axiosClient.patch("/driver/update-location", { driverId, coords });
};

export const getDriverCurrentBooking = (driverId: string) => {
  return axiosClient.get("/driver/current-booking", { params: { driverId } });
};
