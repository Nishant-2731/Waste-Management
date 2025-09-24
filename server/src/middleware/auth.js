import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({ message: 'Access denied. Invalid token format.' });
    }

    // Ensure secret is set
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user from DB
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : authHeader.trim();

      if (token && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (user) {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    // Don’t block request if optional
    next();
  }
};
