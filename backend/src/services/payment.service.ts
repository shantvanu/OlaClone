// src/services/payment.service.ts
import { log } from "../utils/logger";

/**
 * Mock payment service for assignment. You can replace this with Razorpay/Stripe integration.
 */

export const paymentService = {
  async createPaymentIntent({ amount }: { amount: number }) {
    // simulate provider response
    const providerId = "mock_provider_" + Date.now();
    log("Mock payment intent created for", amount, providerId);
    return { providerId, amount };
  },

  async verifyPayment({ providerId }: { providerId: string }) {
    // In dev, we accept any providerId as successful
    log("Mock payment verified", providerId);
    return { status: "paid", providerId };
  }
};
