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
        required: true
    },
    longitude: {
        type: Number,
        required: true
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
    last_updated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PlaceCache', placeCacheSchema);
