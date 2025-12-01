"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const driverSchema = new mongoose_1.default.Schema({
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
}, { timestamps: true });
exports.default = mongoose_1.default.model("Driver", driverSchema);
