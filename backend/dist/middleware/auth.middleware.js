"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authMiddleware = (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth)
            return res.status(401).json({ msg: "No token provided" });
        const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (err) {
        return res.status(401).json({ msg: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
