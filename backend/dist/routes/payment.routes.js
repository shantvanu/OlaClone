"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/payment.routes.ts
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
// Matches frontend and README spec: /payment/create-intent
router.post("/create-intent", payment_controller_1.createPaymentIntent);
router.post("/verify", payment_controller_1.verifyPayment);
exports.default = router;
