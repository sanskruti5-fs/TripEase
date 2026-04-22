const mongoose = require('mongoose');

const userSavedTripSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trip_plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TripPlan',
        required: true
    },
    saved_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserSavedTrip', userSavedTripSchema);
