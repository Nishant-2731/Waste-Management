import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const router = Router();

// In-memory user storage for when MongoDB is not available
let inMemoryUsers = [];

// Check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d',
  });
};

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: 'Please provide email, password, and name' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    if (isMongoConnected()) {
      // MongoDB is available - use database
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email already exists' 
        });
      }

      const uid = uuidv4();
      const user = new User({
        uid,
        email,
        password,
        name,
        points: 0,
      });

      await user.save();

      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          points: user.points,
        },
      });
    } else {
      // MongoDB is not available - use in-memory storage
      const existingUser = inMemoryUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email already exists' 
        });
      }

      const uid = uuidv4();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = {
        _id: uid,
        uid,
        email,
        password: hashedPassword,
        name,
        points: 0,
        createdAt: new Date(),
      };

      inMemoryUsers.push(user);

      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User created successfully (in-memory mode)',
        token,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          points: user.points,
        },
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    if (isMongoConnected()) {
      // MongoDB is available - use database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }

      const token = generateToken(user._id);

      res.json({
        message: 'Signed in successfully',
        token,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          points: user.points,
        },
      });
    } else {
      // MongoDB is not available - use in-memory storage
      const user = inMemoryUsers.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }

      const token = generateToken(user._id);

      res.json({
        message: 'Signed in successfully (in-memory mode)',
        token,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          points: user.points,
        },
      });
    }
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
});

// Get current user (protected route)
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    if (isMongoConnected()) {
      // MongoDB is available - use database
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid token' 
        });
      }

      res.json({
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          points: user.points,
        },
      });
    } else {
      // MongoDB is not available - use in-memory storage
      const user = inMemoryUsers.find(u => u._id === decoded.userId);

      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid token' 
        });
      }

      res.json({
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          points: user.points,
        },
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ 
      message: 'Invalid token' 
    });
  }
});

export default router;