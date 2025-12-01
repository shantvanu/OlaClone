import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    vehicleType: { type: String, required: true }, // auto | mini | bike | sedan etc.

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["available", "assigned", "accepted", "busy"],
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
    }
  },
  { timestamps: true }
);

driverSchema.index({ location: "2dsphere" });

export default mongoose.model("Driver", driverSchema);
