const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    weight: {
        type: String, // e.g., '500g', '1L'
        required: true
    },
    image: {
        type: String, // URL
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);
