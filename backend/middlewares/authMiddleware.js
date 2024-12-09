const User = require('../models/User'); // Assuming the User model is located here

const authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth Middleware - Incoming Request:', {
      sessionId: req.session.userId,
      sessionData: req.session,
    });

    // Check if the user is authenticated (session-based)
    if (!req.session.userId) {
      console.warn('Auth Middleware - No session ID found');
      return res.status(401).json({
        message: 'Not authenticated. Session ID missing.',
      });
    }

    // Check if the user exists in the database
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.warn('Auth Middleware - User not found:', req.session.userId);
      return res.status(401).json({
        message: 'User not found. Please log in again.',
      });
    }

    // Attach user object to the request object for downstream middleware
    req.user = user;
    console.log('Auth Middleware - User authenticated:', { userId: user._id });

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Auth Middleware - Error:', error);
    return res.status(500).json({
      message: 'Authentication error.',
      errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = { authMiddleware };