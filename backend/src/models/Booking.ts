import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
    pickupLocation: { type: String, required: true },
    dropLocation: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    vehicleType: {
      type: String,
      enum: ["BIKE", "AUTO", "CAR"],
      required: true
    },
    fare: { type: Number, required: true },
    estimatedTimeMin: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "COMPLETED"],
      default: "PENDING"
    },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);

