// src/routes/payment.routes.ts
import { Router } from "express";
import { createPaymentIntent, verifyPayment } from "../controllers/payment.controller";

const router = Router();

// Matches frontend and README spec: /payment/create-intent
router.post("/create-intent", createPaymentIntent);
router.post("/verify", verifyPayment);

export default router;
