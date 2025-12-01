import axiosClient from "./axiosClient";

export const paymentApi = {
  createIntent: (data: { bookingId: string }) =>
    axiosClient.post("/payment/create-intent", data),
  verify: (data: { providerId: string; bookingId: string }) =>
    axiosClient.post("/payment/verify", data),
};
