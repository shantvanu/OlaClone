import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    vehicleType: { type: String, required: true }, // bike | auto | car | mini | sedan etc.

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["available", "assigned", "accepted", "busy", "offline"],
      default: "available"
    },

    assignedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null
    },

    lastAssignedAt: {
      type: Date,
      default: null
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    // Aggregated stats for dashboard
    totalEarnings: {
      type: Number,
      default: 0
    },
    totalRides: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

driverSchema.index({ location: "2dsphere" });

export default mongoose.model("Driver", driverSchema);
