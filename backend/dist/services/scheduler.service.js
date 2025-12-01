"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerService = void 0;
const logger_1 = require("../utils/logger");
/**
 * Scheduler service - not used in minimal implementation
 */
exports.schedulerService = {
    async runScheduler() {
        (0, logger_1.log)("Scheduler service disabled in minimal implementation");
    }
};
