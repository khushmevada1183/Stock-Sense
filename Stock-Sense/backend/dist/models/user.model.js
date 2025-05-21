"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserModel {
    /**
     * Create a new user
     */
    async create(userData) {
        const { email, password, first_name, last_name, role = 'user' } = userData;
        // Hash password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const query = `
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role
    `;
        const values = [email, hashedPassword, first_name || null, last_name || null, role];
        const result = await db_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Find user by email
     */
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db_1.default.query(query, [email]);
        return result.rows[0] || null;
    }
    /**
     * Find user by ID
     */
    async findById(id) {
        const query = 'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1';
        const result = await db_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    /**
     * Update user profile
     */
    async update(id, userData) {
        // Start building query
        let query = 'UPDATE users SET ';
        const values = [];
        let valueIndex = 1;
        // Add fields to update
        const updateFields = [];
        if (userData.email) {
            updateFields.push(`email = $${valueIndex++}`);
            values.push(userData.email);
        }
        if (userData.password) {
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(userData.password, salt);
            updateFields.push(`password = $${valueIndex++}`);
            values.push(hashedPassword);
        }
        if (userData.first_name !== undefined) {
            updateFields.push(`first_name = $${valueIndex++}`);
            values.push(userData.first_name);
        }
        if (userData.last_name !== undefined) {
            updateFields.push(`last_name = $${valueIndex++}`);
            values.push(userData.last_name);
        }
        if (userData.role) {
            updateFields.push(`role = $${valueIndex++}`);
            values.push(userData.role);
        }
        // Add updated_at timestamp
        updateFields.push(`updated_at = NOW()`);
        // Complete the query
        query += updateFields.join(', ');
        query += ` WHERE id = $${valueIndex} RETURNING id, email, first_name, last_name, role`;
        values.push(id);
        const result = await db_1.default.query(query, values);
        return result.rows[0] || null;
    }
    /**
     * Delete user
     */
    async delete(id) {
        const query = 'DELETE FROM users WHERE id = $1';
        const result = await db_1.default.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
}
exports.default = new UserModel();
