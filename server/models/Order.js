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
  plusCode: {
    type: String,
    default: '' // Store the Plus Code used for ordering
  },
  route: [{
    lat: Number,
    lng: Number
  }],
  totalDuration: {
    type: Number, // In seconds, from OSRM
    default: 0
  },
  deliveryStartTime: {
    type: Date,
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
  },
  paymentMethod: {
    type: String, // 'UPI', 'CARD', 'COD'
    default: 'COD'
  },
  paymentStatus: {
    type: String, // 'Pending', 'Success', 'Failed'
    default: 'Pending'
  }
});

module.exports = mongoose.model('Order', OrderSchema);
