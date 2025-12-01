"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// User routes
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
// Driver routes
router.post("/driver/register", auth_controller_1.registerDriver);
router.post("/driver/login", auth_controller_1.loginDriver);
exports.default = router;
