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

const { startSimulation } = require('./services/simulation');

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('joinOrder', (trackingId) => {
        socket.join(trackingId);
        console.log(`Socket ${socket.id} joined order ${trackingId}`);

        // Trigger simulation for this tracking ID
        // For demo, we assume a fixed route or get it from DB. 
        // Here passing some offsets to make it look real.
        startSimulation(io, trackingId,
            { lat: 28.6139, lng: 77.2090 }, // Start (Dark Store)
            { lat: 28.6300, lng: 77.2200 }  // End (Customer)
        );
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
const orderRoutes = require('./routes/orders')(io);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
