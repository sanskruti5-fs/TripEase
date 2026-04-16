const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const tripController = require('../controllers/tripController');
const placeController = require('../controllers/placeController');

/**
 * TripEase API Routes
 */

// 1. Search Destination (Geocoding + Initial POI Cache)
router.post('/search-destination', destinationController.searchDestination);

// 2. Generate Trip Plan (Itinerary + Recommendations)
router.post('/get-trip-plan', tripController.getTripPlan);

// 3. Category-specific Queries
router.get('/get-hotels', placeController.getHotels);
router.get('/get-food', placeController.getFood);
router.get('/get-nearby-markets', placeController.getMarkets);
router.get('/get-emergency-services', placeController.getEmergencyServices);
router.get('/get-map-points', placeController.getMapPoints);

// 4. Saved Trips Management
router.post('/save-trip', tripController.saveTrip);
router.get('/get-saved-trips/:userId', tripController.getSavedTrips);

module.exports = router;
