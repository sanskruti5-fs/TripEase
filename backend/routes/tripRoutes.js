const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

/**
 * TripEase Trip Routes
 * Handles the core free features: searching and planning.
 */

// 1. Search Destination (Geocoding + POI Cache)
router.post('/search', tripController.searchDestination);

// 2. Generate Trip Plan
router.post('/generate-plan', tripController.getTripPlan);

// 3. Category-specific Queries
router.get('/places/category', tripController.getByCategory);
router.get('/places/map-points', tripController.getMapPoints);

// 4. Saved Trips Management
router.post('/save', tripController.saveTrip);
router.get('/saved/:userId', tripController.getSavedTrips);

module.exports = router;
