"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createPaymentIntent = void 0;
const payment_service_1 = require("../services/payment.service");
const logger_1 = require("../utils/logger");
const createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }
        const paymentIntent = await payment_service_1.paymentService.createPaymentIntent({ amount });
        res.json(paymentIntent);
    }
    catch (error) {
        (0, logger_1.log)("Payment intent creation error:", error);
        res.status(500).json({ error: "Failed to create payment intent" });
    }
};
exports.createPaymentIntent = createPaymentIntent;
const verifyPayment = async (req, res) => {
    try {
        const { providerId } = req.body;
        if (!providerId) {
            return res.status(400).json({ error: "Provider ID is required" });
        }
        const result = await payment_service_1.paymentService.verifyPayment({ providerId });
        res.json(result);
    }
    catch (error) {
        (0, logger_1.log)("Payment verification error:", error);
        res.status(500).json({ error: "Failed to verify payment" });
    }
};
exports.verifyPayment = verifyPayment;
