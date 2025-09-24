import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get or create user by uid (legacy route - updated to work with authenticated users)
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    let user = await User.findOne({ uid }).lean();
    if (!user) {
      // Don't create user automatically anymore - they need to sign up
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }
    res.json({ uid: user.uid, points: user.points, name: user.name, email: user.email });
  } catch (err) {
    console.error('GET /users/:uid error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Award points (protected route)
router.post('/:uid/award', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const { amount, reason, serial } = req.body || {};

    // Check if the authenticated user matches the uid
    if (req.user.uid !== uid) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findOneAndUpdate(
      { uid },
      {
        $inc: { points: parsedAmount },
        $push: {
          logs: {
            type: 'award',
            amount: parsedAmount,
            reason: reason || null,
            serial: serial || null,
          },
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ uid: user.uid, points: user.points });
  } catch (err) {
    console.error('POST /users/:uid/award error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Redeem points (protected route)
router.post('/:uid/redeem', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const { cost, name } = req.body || {};

    // Check if the authenticated user matches the uid
    if (req.user.uid !== uid) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const parsedCost = Number(cost);
    if (!Number.isFinite(parsedCost) || parsedCost <= 0) {
      return res.status(400).json({ message: 'Invalid cost' });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.points < parsedCost) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    user.points -= parsedCost;
    user.logs.push({
      type: 'redeem',
      amount: parsedCost,
      name: name || null,
    });
    await user.save();

    return res.json({ uid: user.uid, points: user.points });
  } catch (err) {
    console.error('POST /users/:uid/redeem error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user points (protected route)
router.put('/points', authenticateToken, async (req, res) => {
  try {
    const { points } = req.body;
    
    if (typeof points !== 'number' || points < 0) {
      return res.status(400).json({ message: 'Invalid points value' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { points },
      { new: true }
    );

    return res.json({ 
      uid: user.uid, 
      points: user.points,
      name: user.name,
      email: user.email 
    });
  } catch (err) {
    console.error('PUT /users/points error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Award points to current user (simplified route)
router.post('/award', authenticateToken, async (req, res) => {
  try {
    const { amount, reason, serial } = req.body || {};

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: { points: parsedAmount },
        $push: {
          logs: {
            type: 'award',
            amount: parsedAmount,
            reason: reason || 'device-serial',
            serial: serial || null,
          },
        },
      },
      { new: true }
    );

    return res.json({ uid: user.uid, points: user.points });
  } catch (err) {
    console.error('POST /users/award error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;