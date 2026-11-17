const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get all registered users (Protected route)
router.get('/', protect, async (req, res) => {
  try {
    // Select all users, but exclude their password hashes for security
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

module.exports = router;