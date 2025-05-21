"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = __importDefault(require("../config/env"));
const user_model_1 = __importDefault(require("../models/user.model"));
class AuthController {
    /**
     * Register a new user
     */
    async register(req, res) {
        try {
            // Extract user data
            const { email, password, first_name, last_name } = req.body;
            // Check if user already exists
            const existingUser = await user_model_1.default.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            // Create new user
            const user = await user_model_1.default.create({
                email,
                password,
                first_name,
                last_name,
                role: 'user', // Default role
            });
            // Generate JWT token
            const payload = { id: user.id, email: user.email, role: user.role };
            const token = jsonwebtoken_1.default.sign(payload, env_1.default.JWT_SECRET, { expiresIn: env_1.default.JWT_EXPIRES_IN });
            // Return user data and token
            return res.status(201).json({
                user,
                token,
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({
                message: 'Registration failed',
                error: env_1.default.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    /**
     * Login user
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // Check if user exists
            const user = await user_model_1.default.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            // Check password
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            // Generate JWT token
            const payload = { id: user.id, email: user.email, role: user.role };
            const token = jsonwebtoken_1.default.sign(payload, env_1.default.JWT_SECRET, { expiresIn: env_1.default.JWT_EXPIRES_IN });
            // Return user profile and token
            return res.status(200).json({
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                },
                token,
            });
        }
        catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                message: 'Login failed',
                error: env_1.default.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    /**
     * Get current user
     */
    async getCurrentUser(req, res) {
        try {
            // User ID should be available from auth middleware
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            // Get user profile
            const user = await user_model_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({ user });
        }
        catch (error) {
            console.error('Get current user error:', error);
            return res.status(500).json({
                message: 'Failed to retrieve user data',
                error: env_1.default.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
}
exports.default = new AuthController();
