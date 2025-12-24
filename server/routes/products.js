const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new product
router.post('/', async (req, res) => {
    const { name, price, weight, image, category } = req.body;

    if (!name || !price || !weight || !image) {
        return res.status(400).json({ message: 'All fields (name, price, weight, image) are required' });
    }

    const product = new Product({
        name,
        price,
        weight,
        image,
        category
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
