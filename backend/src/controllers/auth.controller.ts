import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import env from '../config/env';
import userModel, { CreateUserInput } from '../models/user.model';

class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      // Extract user data
      const { email, password, first_name, last_name }: CreateUserInput = req.body;
      
      // Check if user already exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      // Create new user
      const user = await userModel.create({
        email,
        password,
        first_name,
        last_name,
        role: 'user', // Default role
      });
      
      // Generate JWT token
      const payload = { id: user.id, email: user.email, role: user.role };
      const token = jwt.sign(
        payload, 
        env.JWT_SECRET, 
        { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
      );
      
      // Return user data and token
      return res.status(201).json({
        user,
        token,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      return res.status(500).json({
        message: 'Registration failed',
        error: env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
  
  /**
   * Login user
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // Check if user exists
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const payload = { id: user.id, email: user.email, role: user.role };
      const token = jwt.sign(
        payload, 
        env.JWT_SECRET, 
        { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
      );
      
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
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({
        message: 'Login failed',
        error: env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
  
  /**
   * Get current user
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      // User ID should be available from auth middleware
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Get user profile
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({ user });
    } catch (error: any) {
      console.error('Get current user error:', error);
      return res.status(500).json({
        message: 'Failed to retrieve user data',
        error: env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}

export default new AuthController(); 