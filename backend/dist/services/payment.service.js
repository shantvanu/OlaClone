"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
// src/services/payment.service.ts
const logger_1 = require("../utils/logger");
/**
 * Mock payment service for assignment. You can replace this with Razorpay/Stripe integration.
 */
exports.paymentService = {
    async createPaymentIntent({ amount }) {
        // simulate provider response
        const providerId = "mock_provider_" + Date.now();
        (0, logger_1.log)("Mock payment intent created for", amount, providerId);
        return { providerId, amount };
    },
    async verifyPayment({ providerId }) {
        // In dev, we accept any providerId as successful
        (0, logger_1.log)("Mock payment verified", providerId);
        return { status: "paid", providerId };
    }
};
