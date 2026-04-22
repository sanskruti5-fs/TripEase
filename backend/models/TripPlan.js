const mongoose = require('mongoose');

const tripPlanSchema = new mongoose.Schema({
    destination: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    trip_type: {
        type: String,
        enum: ['family', 'solo', 'luxury', 'adventure', 'couple', 'friends', 'relaxation', 'romantic', 'budget', 'relax', 'cultural'],
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    generated_plan: {
        type: mongoose.Schema.Types.Mixed, // Equivalent to JSON
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TripPlan', tripPlanSchema);
