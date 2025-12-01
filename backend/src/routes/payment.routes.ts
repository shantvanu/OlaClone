// src/routes/payment.routes.ts
import { Router } from "express";
import { createPaymentIntent, verifyPayment } from "../controllers/payment.controller";

const router = Router();

router.post("/init", createPaymentIntent);
router.post("/verify", verifyPayment);


export default router;
