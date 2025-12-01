"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BookingSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Driver", default: null },
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
}, { timestamps: true });
exports.default = mongoose_1.default.model("Booking", BookingSchema);
