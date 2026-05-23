const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, authorize('patient'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', protect, authorize('patient'), async (req, res) => {
  try {
    const { name, phone, address, gender, dob } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address, gender, dob }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
