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
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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
  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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
