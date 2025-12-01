"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
// src/utils/logger.ts
const log = (...args) => {
    console.log(`[${new Date().toISOString()}]`, ...args);
};
exports.log = log;
