// src/controllers/payment.controller.ts
import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import Booking from "../models/Booking";

/** Mock create-intent endpoint – returns providerId & amount */
export const createPaymentIntent = async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ msg: "bookingId required" });

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ msg: "Booking not found" });

  const amount = (booking.fareBreakdown as any)?.total || 0;
  const intent = await paymentService.createPaymentIntent({ amount });

  // Normalize response to { providerId, amount } as per spec
  return res.json({
    ok: true,
    providerId: intent.providerId,
    amount: intent.amount
  });
};

export const verifyPayment = async (req: Request, res: Response) => {
  const { providerId, bookingId } = req.body;
  if (!providerId || !bookingId) return res.status(400).json({ msg: "providerId & bookingId required" });

  const result = await paymentService.verifyPayment({ providerId });

  if (result.status === "paid") {
    await Booking.findByIdAndUpdate(bookingId, {
      $set: {
        "payment.status": "paid",
        "payment.providerId": providerId
      }
    });
    return res.json({ ok: true });
  }

  return res.status(400).json({ ok: false });
};
