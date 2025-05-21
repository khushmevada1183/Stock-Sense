import { QueryResult } from 'pg';
import pool from '../db';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

class UserModel {
  /**
   * Create a new user
   */
  async create(userData: CreateUserInput): Promise<UserProfile> {
    const { email, password, first_name, last_name, role = 'user' } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const query = `
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role
    `;
    
    const values = [email, hashedPassword, first_name || null, last_name || null, role];
    
    const result: QueryResult<UserProfile> = await pool.query(query, values);
    return result.rows[0];
  }
  
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result: QueryResult<User> = await pool.query(query, [email]);
    return result.rows[0] || null;
  }
  
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserProfile | null> {
    const query = 'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1';
    const result: QueryResult<UserProfile> = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
  
  /**
   * Update user profile
   */
  async update(id: string, userData: Partial<CreateUserInput>): Promise<UserProfile | null> {
    // Start building query
    let query = 'UPDATE users SET ';
    const values: any[] = [];
    let valueIndex = 1;
    
    // Add fields to update
    const updateFields: string[] = [];
    
    if (userData.email) {
      updateFields.push(`email = $${valueIndex++}`);
      values.push(userData.email);
    }
    
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
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
    
    const result: QueryResult<UserProfile> = await pool.query(query, values);
    return result.rows[0] || null;
  }
  
  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export default new UserModel(); 