require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { ObjectId } = require('mongodb');

const app = express();

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL (ensure this is updated if deploying)
  credentials: true
}));

app.use(express.json());  // Parse incoming JSON requests

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use true in production if HTTPS is enabled
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  avatar: String,
  isAdmin: { type: Boolean, default: false }, // Added isAdmin flag
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

// Order Schema
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  paymentDetails: {
    lastFourDigits: String
  },
  subtotal: Number,
  shipping: Number,
  tax: Number,
  total: Number,
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', OrderSchema);

// Authentication Route (Google OAuth or any other method)
app.post('/api/auth/google', async (req, res) => {
  const { name, email, picture } = req.body;
  console.log('Received user data:', { name, email, picture });

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        avatar: picture
      });
      await user.save();
      console.log('New user created:', user);
    } else {
      console.log('User found:', user);
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

// Logout Route
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Order Routes
// Create a new order
app.post('/api/orders', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const newOrder = new Order({
      user: req.session.userId,
      items: req.body.items,
      address: req.body.address,
      paymentDetails: req.body.paymentDetails,
      subtotal: req.body.subtotal,
      shipping: req.body.shipping,
      tax: req.body.tax,
      total: req.body.total,
      status: req.body.status || 'Pending'
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get user's orders
app.get('/api/orders', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const orders = await Order.find({ user: req.session.userId })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ message: 'Could not fetch orders' });
  }
});

// Get a specific order
app.get('/api/orders/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const order = await Order.findOne({
      _id: ObjectId(req.params.id),
      user: req.session.userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Fetch order error:', error);
    res.status(500).json({ message: 'Could not fetch order' });
  }
});

// Cancel an order
app.patch('/api/orders/:id/cancel', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const order = await Order.findOne({
      _id: new ObjectId(req.params.id), // Fix: Using 'new' with ObjectId
      user: req.session.userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order is already cancelled
    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Update order status to 'Cancelled'
    order.status = 'Cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});


// Admin Route to Fetch All Orders and User Details
app.get('/api/admin/orders', async (req, res) => {
  // Check if the user is an admin
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // Fetch all orders and populate the user details
    const orders = await Order.find()
      .populate('user', 'name email avatar') // Populate user details
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Admin Route to Fetch a Specific Order and its User
app.get('/api/admin/orders/:id', async (req, res) => {
  // Check if the user is an admin
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email avatar');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching specific order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
