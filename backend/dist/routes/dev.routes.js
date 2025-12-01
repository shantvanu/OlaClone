"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dev_controller_1 = require("../controllers/dev.controller");
const router = (0, express_1.Router)();
// /dev/seed – create demo user & drivers for quick testing
router.post("/seed", dev_controller_1.seedDevData);
exports.default = router;
