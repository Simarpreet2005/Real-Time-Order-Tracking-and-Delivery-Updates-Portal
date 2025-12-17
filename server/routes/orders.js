const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

module.exports = (io) => {
    // Create a new order
    router.post('/', async (req, res) => {
        try {
            const { customer, trackingId, initialLocation } = req.body;
            const newOrder = new Order({
                trackingId,
                customer,
                currentLocation: initialLocation,
                history: [{ status: 'Ordered', location: initialLocation?.address || 'Warehouse' }]
            });
            await newOrder.save();
            res.status(201).json(newOrder);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get all orders (for admin)
    router.get('/', async (req, res) => {
        try {
            const orders = await Order.find().sort({ createdAt: -1 });
            res.json(orders);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get order by tracking ID
    router.get('/:trackingId', async (req, res) => {
        try {
            const order = await Order.findOne({ trackingId: req.params.trackingId });
            if (!order) return res.status(404).json({ message: 'Order not found' });
            res.json(order);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Update order status/location
    router.put('/:trackingId/status', async (req, res) => {
        try {
            const { status, location } = req.body;
            const order = await Order.findOne({ trackingId: req.params.trackingId });
            if (!order) return res.status(404).json({ message: 'Order not found' });

            order.status = status;
            if (location) order.currentLocation = location;

            order.history.push({
                status,
                location: location ? location.address : order.currentLocation.address
            });

            await order.save();

            // Emit real-time event
            io.emit('orderUpdated', order);

            res.json(order);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
