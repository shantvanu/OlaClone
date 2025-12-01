// src/models/Booking.ts
import mongoose from "mongoose";

const LatLngSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
}, { _id: false });

const LocationSchema = new mongoose.Schema({
  address: { type: String, default: "" },
  coords: { type: LatLngSchema, required: true }
}, { _id: false });

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pickup: { type: LocationSchema, required: true },
    drop: { type: LocationSchema, required: true },
    distanceKm: { type: Number, default: 0 },
    durationText: { type: String, default: "" },
    rideType: { type: String, required: true },
    fareBreakdown: { type: Object, default: {} },
    payment: {
      method: { type: String, default: "cash" },
      status: { type: String, default: "pending" },
      providerId: String
    },
    status: {
      type: String,
      enum: ["scheduled","pending_assignment","assigned","accepted","running","completed","cancelled","unassigned"],
      default: "pending_assignment"
    },
    scheduledFor: Date,
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
    logs: [{ ts: Date, text: String }],
    lastDropUpdateAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
