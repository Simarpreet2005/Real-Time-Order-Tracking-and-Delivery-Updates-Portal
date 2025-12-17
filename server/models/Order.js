const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: String,
    address: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['Ordered', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'],
    default: 'Ordered'
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  history: [{
    status: String,
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
