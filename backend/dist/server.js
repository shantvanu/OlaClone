"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/rideApp";
const startServer = async () => {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        (0, logger_1.log)("MongoDB Connected ✔️");
        app_1.default.listen(PORT, () => {
            (0, logger_1.log)(`Server running at http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Server startup error ❌", error);
        process.exit(1);
    }
};
startServer();
