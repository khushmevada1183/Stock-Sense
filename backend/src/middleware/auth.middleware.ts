import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware to protect routes
 * Validates JWT token and attaches user data to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET || 'default_secret_for_development') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

/**
 * Role-based authorization middleware
 * Ensures user has required role to access route
 * Must be used after authenticate middleware
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized - No user found' });
    }

    const userRole = req.user.role;

    if (roles.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden - Insufficient privileges' });
    }
  };
};

// Middleware to check if user has the required role
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized - No user found' });
    }

    const userRole = req.user.role;

    if (roles.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden - Insufficient privileges' });
    }
  };
}; 