"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
/**
 * Authentication middleware to protect routes
 * Validates JWT token and attaches user data to request
 */
const authenticate = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token required' });
        }
        // Extract token
        const token = authHeader.split(' ')[1];
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET || 'default_secret_for_development');
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};
exports.authenticate = authenticate;
/**
 * Role-based authorization middleware
 * Ensures user has required role to access route
 * Must be used after authenticate middleware
 */
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized - No user found' });
        }
        const userRole = req.user.role;
        if (roles.includes(userRole)) {
            next();
        }
        else {
            return res.status(403).json({ message: 'Forbidden - Insufficient privileges' });
        }
    };
};
exports.authorize = authorize;
// Middleware to check if user has the required role
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized - No user found' });
        }
        const userRole = req.user.role;
        if (roles.includes(userRole)) {
            next();
        }
        else {
            return res.status(403).json({ message: 'Forbidden - Insufficient privileges' });
        }
    };
};
exports.checkRole = checkRole;
