const TripPlan = require('../models/TripPlan');
const UserSavedTrip = require('../models/UserSavedTrip');
const Destination = require('../models/Destination');
const PlaceCache = require('../models/PlaceCache');
const tripPlanService = require('../services/tripPlanService');
const osmService = require('../services/osmService');
const { checkVerifiedCity } = require('../utils/verifiedCities');

/**
 * Trip Controller
 * Handles destination searching, POI fetching, and itinerary generation.
 */
const tripController = {
    /**
     * Search and cache destination details + POIs.
     */
    async searchDestination(req, res) {
        const { destination } = req.body;
        if (!destination) {
            return res.status(400).json({ error: 'Destination is required' });
        }

        try {
            let destRecord = await Destination.findOne({
                name: new RegExp(destination, 'i')
            });

            const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

            if (destRecord && destRecord.last_updated > oneMinuteAgo) {
                const places = await PlaceCache.find({ destination_id: destRecord._id });
                if (places.length > 0) {
                    return res.json({ destination: destRecord, places });
                }
                console.log(`Cache for ${destination} is empty, forcing refresh...`);
            }

            // --- INSTANT RESOLVE FOR VERIFIED CITIES ---
            const verified = checkVerifiedCity(destination);
            if (verified) {
                console.log(`✅ Instant Resolve for verified city: ${verified.name}`);
                
                // Get or Create Destination
                if (!destRecord) {
                    destRecord = await Destination.create({
                        name: verified.name,
                        latitude: 0,
                        longitude: 0,
                        last_updated: new Date()
                    });
                }

                // Clear and Bulk Create
                await PlaceCache.deleteMany({ destination_id: destRecord._id });
                
                const verifiedItems = [
                    ...(verified.data.places || []).map(p => ({ ...p, category: 'attraction' })),
                    ...(verified.data.food || []).map(f => ({ ...f, category: 'food' })),
                    ...(verified.data.markets || []).map(m => ({ ...m, category: 'market' }))
                ];

                const placeRecords = verifiedItems.map(p => ({
                    destination_id: destRecord._id,
                    place_name: p.name,
                    category: p.category,
                    latitude: p.latitude || 0,
                    longitude: p.longitude || 0,
                    description: p.description || 'Verified local destination.',
                    rating: (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1),
                    image_url: p.image,
                    best_time_to_visit: 'Morning to Evening',
                    estimated_budget: p.entryFee ? `₹${p.entryFee}` : 'Free',
                    suitability: 'Family & Friends',
                    address: destination,
                    last_updated: new Date()
                }));

                await PlaceCache.insertMany(placeRecords);
                const results = await PlaceCache.find({ destination_id: destRecord._id });
                return res.json({ destination: destRecord, places: results, verified: true });
            }

            // Fetch fresh data
            const coords = await osmService.getCoordinates(destination);
            
            if (!destRecord) {
                destRecord = await Destination.create({
                    name: destination,
                    latitude: coords.lat,
                    longitude: coords.lon,
                    last_updated: new Date()
                });
            } else {
                destRecord.latitude = coords.lat;
                destRecord.longitude = coords.lon;
                destRecord.last_updated = new Date();
                await destRecord.save();
            }

            let poiList = [];
            try {
                poiList = await osmService.fetchNearbyPlaces(coords.lat, coords.lon);
            } catch (poiError) {
                console.warn('POI Fetch failed, using popular fallbacks:', poiError.message);
            }

            if (poiList.length < 5) {
                const fallbacks = {
                    'Delhi': [
                        { name: 'Red Fort', category: 'attraction', latitude: 28.6562, longitude: 77.2410, tags: { 'addr:suburb': 'Old Delhi' } },
                        { name: 'India Gate', category: 'attraction', latitude: 28.6129, longitude: 77.2295 },
                        { name: 'Qutub Minar', category: 'attraction', latitude: 28.5245, longitude: 77.1855 }
                    ],
                    'Mumbai': [
                        { name: 'Gateway of India', category: 'attraction', latitude: 18.9220, longitude: 72.8347 },
                        { name: 'Marine Drive', category: 'attraction', latitude: 18.9431, longitude: 72.8230 }
                    ],
                    'Paris': [
                        { name: 'Eiffel Tower', category: 'attraction', latitude: 48.8584, longitude: 2.2945 },
                        { name: 'Louvre Museum', category: 'museum', latitude: 48.8606, longitude: 2.3376 }
                    ],
                    'London': [
                        { name: 'Big Ben', category: 'attraction', latitude: 51.5007, longitude: -0.1246 },
                        { name: 'London Eye', category: 'attraction', latitude: 51.5033, longitude: -0.1195 }
                    ],
                    'Tokyo': [
                        { name: 'Shibuya Crossing', category: 'attraction', latitude: 35.6595, longitude: 139.7005 },
                        { name: 'Tokyo Tower', category: 'attraction', latitude: 35.6586, longitude: 139.7454 }
                    ]
                };

                const cityKey = Object.keys(fallbacks).find(k => destination.toLowerCase().includes(k.toLowerCase()));
                if (cityKey) {
                    poiList = [...poiList, ...fallbacks[cityKey]];
                }
            }

            await PlaceCache.deleteMany({ destination_id: destRecord._id });
            const placeRecords = poiList.map(p => {
                const bestTimes = ['Early Morning', 'Morning to Afternoon', 'Late Afternoon', 'Evening', 'Sunset', 'Anytime'];
                const bestTime = bestTimes[Math.floor(Math.random() * bestTimes.length)];
                
                let budget = '₹' + (Math.floor(Math.random() * 1500) + 300);
                if (p.category === 'hotel') budget = '₹' + (Math.floor(Math.random() * 8000) + 2000) + ' / night';
                if (p.category === 'beach' || p.category === 'temple') budget = 'Free or Nominal Entry';

                const suitabilityMap = {
                    'attraction': 'Family & Sightseeing',
                    'museum': 'Educational & Family',
                    'temple': 'Family & Peace',
                    'beach': 'Relaxation & Friends',
                    'food': 'Foodies & Friends',
                    'hotel': 'Couples & Solo',
                    'market': 'Solo & Shopping',
                    'gem': 'Adventure & Solo'
                };
                const suitability = suitabilityMap[p.category] || 'General Visit';

                const tags = p.tags || {};
                const shortAddress = tags['addr:suburb'] || tags['addr:neighbourhood'] || tags['addr:quarter'] || destination;

                const signatureFoods = {
                    'Delhi': ['Chole Bhature', 'Butter Chicken'], 'Mumbai': ['Vada Pav', 'Pav Bhaji'], 'Paris': ['Croissant', 'Macarons'], 'London': ['Fish and Chips'], 'Tokyo': ['Sushi', 'Ramen']
                };

                const cityKey = Object.keys(signatureFoods).find(k => destination.toLowerCase().includes(k.toLowerCase()));
                const dishes = signatureFoods[cityKey] || ['Local Special Dish'];
                const randomDish = dishes[Math.floor(Math.random() * dishes.length)];

                let finalName = p.name;
                if (p.category === 'food' || (p.tags && p.tags.amenity === 'restaurant')) {
                    finalName = `Famous ${randomDish} @ ${p.name}`;
                }

                return {
                    destination_id: destRecord._id,
                    place_name: finalName,
                    category: p.category,
                    latitude: p.latitude,
                    longitude: p.longitude,
                    description: `Experience the authentic taste of ${randomDish} at this highly rated spot in ${shortAddress}.`,
                    rating: (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1),
                    image_url: `https://loremflickr.com/800/600/${encodeURIComponent(destination)},${encodeURIComponent(p.category || 'food')}/all/?lock=${Math.floor(Math.random() * 1000)}`,
                    best_time_to_visit: bestTime,
                    estimated_budget: budget,
                    suitability: suitability,
                    address: shortAddress,
                    last_updated: new Date()
                };
            });

            await PlaceCache.insertMany(placeRecords);
            const savedPlaces = await PlaceCache.find({ destination_id: destRecord._id });

            res.json({ destination: destRecord, places: savedPlaces });
        } catch (error) {
            console.error('Search Destination Error:', error.message);
            res.status(500).json({ error: 'Failed to search destination. Please check the city name.' });
        }
    },

    async getTripPlan(req, res) {
        const { destination, tripType, budget, duration } = req.body;

        try {
            const destRecord = await Destination.findOne({
                name: new RegExp(destination, 'i')
            });

            if (!destRecord) {
                return res.status(404).json({ error: 'Destination details not found. Please search first.' });
            }

            const places = await PlaceCache.find({ destination_id: destRecord._id });
            const generatedPlan = tripPlanService.generatePlan(destination, tripType, budget, duration, places);

            const tripPlanRecord = await TripPlan.create({
                destination,
                budget,
                trip_type: tripType,
                duration,
                generated_plan: generatedPlan,
                created_at: new Date()
            });

            res.json(tripPlanRecord);
        } catch (error) {
            console.error('Get Trip Plan Error:', error.message);
            res.status(500).json({ error: 'Failed to generate trip plan' });
        }
    },

    async saveTrip(req, res) {
        const { userId, tripPlanId } = req.body;
        try {
            const savedTrip = await UserSavedTrip.create({
                user_id: userId,
                trip_plan_id: tripPlanId,
                saved_at: new Date()
            });
            res.json({ message: 'Trip saved successfully', savedTrip });
        } catch (error) {
            res.status(500).json({ error: 'Failed to save trip' });
        }
    },

    async getSavedTrips(req, res) {
        const { userId } = req.params;
        try {
            const savedTrips = await UserSavedTrip.find({
                user_id: userId
            }).populate('trip_plan_id');
            res.json(savedTrips);
        } catch (error) {
            console.error('Get Saved Trips Error:', error.message);
            res.status(500).json({ error: 'Failed to retrieve saved trips' });
        }
    },

    async getByCategory(req, res) {
        const { destination, category } = req.query;
        if (!destination || !category) {
            return res.status(400).json({ error: 'Destination and category are required' });
        }

        try {
            const destRecord = await Destination.findOne({
                name: new RegExp(destination, 'i')
            });

            if (!destRecord) {
                return res.status(404).json({ error: 'Destination not found in cache.' });
            }

            const items = await PlaceCache.find({
                destination_id: destRecord._id,
                category: category
            });

            res.json(items);
        } catch (error) {
            console.error(`Get ${category} Error:`, error.message);
            res.status(500).json({ error: `Failed to retrieve ${category}` });
        }
    },

    async getMapPoints(req, res) {
        const { destination } = req.query;
        if (!destination) {
            return res.status(400).json({ error: 'Destination is required' });
        }

        try {
            const destRecord = await Destination.findOne({
                name: new RegExp(destination, 'i')
            });

            if (!destRecord) return res.status(404).json({ error: 'Destination not found' });

            const points = await PlaceCache.find({
                destination_id: destRecord._id
            });

            res.json({
                destination: destRecord,
                points: points
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve map points' });
        }
    }
};

module.exports = tripController;
