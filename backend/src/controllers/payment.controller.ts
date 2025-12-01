// src/controllers/payment.controller.ts
import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { log } from "../utils/logger";

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await paymentService.createPaymentIntent({ amount });
    res.json(paymentIntent);
  } catch (error) {
    log("Payment intent creation error:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.body;
    
    if (!providerId) {
      return res.status(400).json({ error: "Provider ID is required" });
    }

    const result = await paymentService.verifyPayment({ providerId });
    res.json(result);
  } catch (error) {
    log("Payment verification error:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};
