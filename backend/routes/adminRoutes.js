const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint to update order status
router.patch('/orders/:orderId/status', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate inputs
    if (!orderId || !status) {
      return res.status(400).json({ 
        message: 'Order ID and status are required' 
      });
    }

    // Check if orderId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        message: 'Invalid Order ID format' 
      });
    }

    // Comprehensive logging
    console.log('Received Order Update Request:', {
      orderId,
      status,
      userId: req.session.userId
    });

    // Find the order with more detailed error checking
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.warn(`Order not found: ${orderId}`);
      return res.status(404).json({ 
        message: 'Order not found',
        details: {
          orderId,
          existingOrders: await Order.find({}, '_id status').limit(10) // Log some existing orders
        }
      });
    }

    // Ensure the user is an admin
    const user = await User.findById(req.session.userId);
    if (!user || !user.isAdmin) {
      console.warn(`Unauthorized access attempt by user: ${req.session.userId}`);
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Validate status value (optional - adjust based on your status enum/options)
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid order status',
        validStatuses 
      });
    }

    // Update the order status
    order.status = status;
    await order.save();

    // Log successful update
    console.log(`Order ${orderId} status updated to ${status}`);

    // Return updated order details
    res.json({ 
      message: 'Order status updated successfully', 
      order: {
        _id: order._id,
        status: order.status
      }
    });

  } catch (error) {
    // Comprehensive error logging
    console.error('Error updating order status:', {
      error: error.message,
      stack: error.stack,
      orderId: req.params.orderId
    });

    res.status(500).json({ 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});

module.exports = router;