// src/services/payment.service.ts
import { log } from "../utils/logger";

/**
 * Mock payment service for assignment. You can replace this with Razorpay/Stripe integration.
 */

export const paymentService = {
  async createPaymentIntent({ amount }: { amount: number }) {
    // simulate provider response
    const clientSecret = "mock_client_secret_" + Date.now();
    log("Mock payment intent created for", amount, clientSecret);
    return { clientSecret, amount };
  },

  async verifyPayment({ providerId }: { providerId: string }) {
    // In dev, we accept any providerId
    log("Mock payment verified", providerId);
    return { status: "paid", providerId };
  }
};
