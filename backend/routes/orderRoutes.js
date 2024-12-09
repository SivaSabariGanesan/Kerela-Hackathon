const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.post('/google', async (req, res) => {
  const { name, email, picture } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        avatar: picture
      });
      await user.save();
    }

    req.session.userId = user._id;

    res.json({
      name: user.name,
      email: user.email,
      picture: user.avatar
    });
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Could not log out' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;