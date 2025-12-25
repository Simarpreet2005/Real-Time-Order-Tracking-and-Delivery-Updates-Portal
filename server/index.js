//The main connecting file
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Setup
const io = socketIo(server, {
    cors: {
        origin: "*", // In production, replace with client URL
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('joinOrder', (trackingId) => {
        socket.join(trackingId);
        console.log(`[DEBUG] Socket ${socket.id} joined ORDER room: ${trackingId}`);
    });

    socket.on('joinRiderRoom', (riderId) => {
        socket.join(`rider_${riderId}`);
        console.log(`[DEBUG] Socket ${socket.id} joined RIDER room: rider_${riderId} for Rider ID: ${riderId}`);
    });

    socket.on('joinAdminRoom', () => {
        socket.join('admin');
        console.log(`[DEBUG] Socket ${socket.id} joined ADMIN room`);
    });

    socket.on('updateLocation', (data) => {
        // data: { trackingId, location: { lat, lng } }
        const { trackingId, location } = data;
        io.to(trackingId).emit('locationUpdate', location);
        console.log(`[DEBUG] Location update for ${trackingId}:`, location);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/order-tracking';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
const orderRoutes = require('./routes/orders')(io);
app.use('/api/orders', orderRoutes);
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
