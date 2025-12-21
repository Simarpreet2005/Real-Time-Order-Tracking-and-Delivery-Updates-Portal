const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users (for admin)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all riders/delivery partners
router.get('/riders', async (req, res) => {
    try {
        const riders = await User.find({ role: 'rider' }).select('-password');
        res.json(riders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
