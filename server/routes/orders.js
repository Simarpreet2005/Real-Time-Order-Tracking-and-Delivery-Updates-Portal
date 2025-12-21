const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

module.exports = (io) => {
    // Create a new order
    router.post('/', async (req, res) => {
        try {
            const { customer, trackingId, initialLocation, customerId } = req.body;
            const newOrder = new Order({
                trackingId,
                customer,
                customerId,
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
            const orders = await Order.find().populate('deliveryPersonId', 'name email').sort({ createdAt: -1 });
            res.json(orders);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get orders for a specific rider
    router.get('/rider/:riderId', async (req, res) => {
        try {
            const orders = await Order.find({ deliveryPersonId: req.params.riderId }).sort({ createdAt: -1 });
            res.json(orders);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get order by tracking ID
    router.get('/:trackingId', async (req, res) => {
        try {
            const order = await Order.findOne({ trackingId: req.params.trackingId }).populate('deliveryPersonId', 'name email');
            if (!order) return res.status(404).json({ message: 'Order not found' });
            res.json(order);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get orders for a specific user (customer history)
    router.get('/user/:userId', async (req, res) => {
        try {
            // Assuming customer field stores the user ID or we filter by customer.email if stored differently
            // Based on User schema, we likely store customer details in the order. 
            // Checking the create order route: const { customer ... } = req.body;
            // Let's verify how customer is stored. It seems 'customer' is an object { name, address }.
            // If we are not storing the user ID in the order, we might need to filter by some other means, 
            // or update the create order to store user ID.
            // CAUTION: The current implementation of create order just takes a customer object.
            // Let's check if the 'user' object in frontend has an ID and if we are sending it.
            // For now, I will assume we need to match by something unique if ID isn't there, OR 
            // I should update the create order to include userId if available.

            // Wait, looking at Order model might be necessary. 
            // Let's assume for now we search by "customer.email" or similar if we can, or if we saved the ID.
            // BUT, strictly following the plan which assumes we can query. 
            // Let's look at how orders are created in AdminPage.jsx: 
            // customer: { name: newOrder.customerName, address: newOrder.address }
            // It doesn't seem to link to a User ID.

            // This is a potential issue. The "My Orders" feature requires linking an Order to a User.
            // I should check schema first.
            const orders = await Order.find({ customerId: req.params.userId }).sort({ createdAt: -1 });
            res.json(orders);
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
                location: location ? location.address : order.currentLocation?.address || 'Updated'
            });

            await order.save();

            // Emit real-time event
            io.to(order.trackingId).emit('orderUpdated', order);
            io.to('admin').emit('orderUpdated', order);

            res.json(order);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Cancel order endpoint
    router.put('/:trackingId/cancel', async (req, res) => {
        try {
            const order = await Order.findOne({ trackingId: req.params.trackingId });
            if (!order) return res.status(404).json({ message: 'Order not found' });

            if (!['Ordered', 'Packed'].includes(order.status)) {
                return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
            }

            order.status = 'Cancelled';
            order.history.push({ status: 'Cancelled', location: 'User Request' });

            await order.save();
            await order.populate('deliveryPersonId', 'name email');

            io.to(order.trackingId).emit('orderUpdated', order);
            io.to('admin').emit('orderUpdated', order);

            res.json(order);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Assign order to rider
    router.put('/:trackingId/assign', async (req, res) => {
        try {
            const { riderId } = req.body;
            const order = await Order.findOne({ trackingId: req.params.trackingId });
            if (!order) return res.status(404).json({ message: 'Order not found' });

            order.deliveryPersonId = riderId;
            order.status = 'Packed'; // Move to packed when assigned
            order.history.push({ status: 'Packed', location: 'Warehouse' });

            await order.save();
            await order.populate('deliveryPersonId', 'name email');

            io.to(order.trackingId).emit('orderUpdated', order);
            io.to('admin').emit('orderUpdated', order); // Notify admin of change
            // Notify the rider specifically
            console.log(`[DEBUG] Emitting orderAssigned to room: rider_${riderId}`);
            io.to(`rider_${riderId}`).emit('orderAssigned', order);
            res.json(order);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
