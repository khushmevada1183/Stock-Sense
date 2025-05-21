"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/**
 * Simple logger utility for the application
 */
exports.logger = {
    info: (message, ...args) => {
        console.log(`[INFO] ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    debug: (message, ...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
};
