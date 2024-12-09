const mongoose = require('mongoose');

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
    lastFourDigits: String, // For online payments (e.g., last 4 digits of the card)
    paymentReference: String, // For online payments (e.g., payment ID or reference)
    phoneNumber: String, // For COD payments (store phone number)
    paymentMethod: {
      type: String,
      enum: ['COD', 'Online'],
      required: true
    }
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

module.exports = mongoose.model('Order', OrderSchema);