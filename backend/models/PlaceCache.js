const mongoose = require('mongoose');

const placeCacheSchema = new mongoose.Schema({
    destination_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
        required: true
    },
    place_name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        default: 0
    },
    longitude: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    },
    rating: {
        type: Number,
        default: 4.0
    },
    image_url: {
        type: String
    },
    best_time_to_visit: {
        type: String
    },
    estimated_budget: {
        type: String
    },
    address: {
        type: String
    },
    suitability: {
        type: String
    },
    // --- Hotel-specific fields ---
    price_per_night: {
        type: Number,
        default: null
    },
    amenities: {
        type: [String],
        default: []
    },
    hotel_source: {
        type: String,
        default: null
    },
    tags: {
        type: [String],
        default: []
    },
    // --- Cache control ---
    last_updated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PlaceCache', placeCacheSchema);
