
import express from 'express';
import { signup, signin } from '../controllers/auth.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);

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