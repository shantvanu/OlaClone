"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const driver_routes_1 = __importDefault(require("./routes/driver.routes"));
const dev_routes_1 = __importDefault(require("./routes/dev.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Public
app.use("/auth", auth_routes_1.default);
app.use("/dev", dev_routes_1.default);
// Protected
app.use("/booking", auth_middleware_1.authMiddleware, booking_routes_1.default);
app.use("/driver", auth_middleware_1.authMiddleware, driver_routes_1.default);
exports.default = app;
