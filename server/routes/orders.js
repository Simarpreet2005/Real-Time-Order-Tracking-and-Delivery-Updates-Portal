const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { WAREHOUSE_COORDS, decodePlusCode, getOSRMRoute, checkDeliveryRange } = require('../utils/geo');

module.exports = (io) => {
    // Delivery Simulation Interval Map
    const activeSimulations = new Map();

    const startSimulation = async (order) => {
        if (activeSimulations.has(order.trackingId)) return;

        console.log(`[SIMULATION] Starting for ${order.trackingId}`);

        // Set start time if not set
        if (!order.deliveryStartTime) {
            order.deliveryStartTime = new Date();
            await order.save();
        }

        const routePoints = order.route;

        if (!routePoints || routePoints.length === 0) {
            console.log('[SIMULATION] No route data found.');
            return;
        }

        let currentIndex = 0;
        const totalPoints = routePoints.length;

        const intervalId = setInterval(async () => {
            if (currentIndex >= totalPoints) {
                clearInterval(intervalId);
                activeSimulations.delete(order.trackingId);

                // Auto-mark as delivered when route ends
                order.status = 'Delivered';
                order.history.push({ status: 'Delivered', location: 'Customer Location' });
                order.currentLocation = routePoints[totalPoints - 1]; // Set to last point
                await order.save();

                io.to(order.trackingId).emit('orderUpdated', order);
                io.to('admin').emit('orderUpdated', order);
                console.log(`[SIMULATION] Finished for ${order.trackingId}`);
                return;
            }

            const location = routePoints[currentIndex];

            // Emit location update
            io.to(order.trackingId).emit('locationUpdate', location);

            // Advance index
            currentIndex += 1;

        }, 1000); // 1 update per second

        activeSimulations.set(order.trackingId, intervalId);
    };

    // Create a new order
    router.post('/', async (req, res) => {
        try {
            const { customer, trackingId, customerId, paymentMethod, paymentStatus } = req.body;
            const plusCode = customer.plusCode;

            if (!plusCode) {
                return res.status(400).json({ message: 'Plus Code is required for delivery.' });
            }

            // 1. Resolve Locations
            const warehouseLoc = WAREHOUSE_COORDS;
            let customerLoc;
            try {
                customerLoc = decodePlusCode(plusCode);
            } catch (e) {
                return res.status(400).json({ message: e.message });
            }

            // 2. Get Route
            const routeData = await getOSRMRoute(warehouseLoc, customerLoc);

            // 3. Check Range
            const { allowed, distance } = checkDeliveryRange(routeData.distance);
            if (!allowed) {
                const distanceKm = (distance / 1000).toFixed(2);
                return res.status(400).json({ message: `Location is too far (${distanceKm}km). We only deliver within 3km.` });
            }

            // 3. Create Order
            const newOrder = new Order({
                trackingId,
                customer: {
                    ...customer,
                    address: customerLoc.address
                },
                customerId,
                paymentMethod: paymentMethod || 'COD',
                paymentStatus: paymentStatus || 'Pending',
                plusCode: plusCode,
                currentLocation: warehouseLoc, // Start at Warehouse
                route: routeData.geometry,
                totalDuration: routeData.duration, // Save OSRM duration (seconds)
                history: [{ status: 'Ordered', location: 'Warehouse' }]
            });

            await newOrder.save();
            res.status(201).json(newOrder);

        } catch (err) {
            console.error(err);
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

            // Trigger Simulation if Out for Delivery
            if (status === 'Out for Delivery') {
                startSimulation(order);
            }

            res.json(order);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Verify Payment (Admin only ideally)
    router.put('/:trackingId/payment', async (req, res) => {
        try {
            const { status } = req.body;
            const order = await Order.findOne({ trackingId: req.params.trackingId }).populate('deliveryPersonId', 'name email');
            if (!order) return res.status(404).json({ message: 'Order not found' });

            order.paymentStatus = status;
            await order.save();

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

            // Stop simulation if running
            if (activeSimulations.has(order.trackingId)) {
                clearInterval(activeSimulations.get(order.trackingId));
                activeSimulations.delete(order.trackingId);
            }

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
