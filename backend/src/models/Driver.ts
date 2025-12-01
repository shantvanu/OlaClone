import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    vehicleType: {
      type: String,
      enum: ["BIKE", "AUTO", "CAR"],
      required: true
    },
    walletBalance: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Driver", driverSchema);

