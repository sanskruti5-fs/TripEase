const TripPlan = require('../models/TripPlan');
const UserSavedTrip = require('../models/UserSavedTrip');
const Destination = require('../models/Destination');
const PlaceCache = require('../models/PlaceCache');
const tripPlanService = require('../services/tripPlanService');
const osmService = require('../services/osmService');
const { Op } = require('sequelize');
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
                where: { name: { [Op.like]: `%${destination}%` } }
            });

            const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

            if (destRecord && destRecord.last_updated > oneMinuteAgo) {
                const places = await PlaceCache.findAll({ where: { destination_id: destRecord.id } });
                if (places.length > 0) {
                    return res.json({ destination: destRecord, places });
                }
                // If places are empty, fall through to re-fetch/fallback logic
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
                        latitude: 0, // Simplified for verified
                        longitude: 0,
                        last_updated: new Date()
                    });
                }

                // Clear and Bulk Create from Verified Data
                await PlaceCache.destroy({ where: { destination_id: destRecord.id } });
                
                const verifiedItems = [
                    ...(verified.data.places || []).map(p => ({ ...p, category: 'attraction' })),
                    ...(verified.data.food || []).map(f => ({ ...f, category: 'food' })),
                    ...(verified.data.markets || []).map(m => ({ ...m, category: 'market' }))
                ];

                const placeRecords = verifiedItems.map(p => ({
                    destination_id: destRecord.id,
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

                await PlaceCache.bulkCreate(placeRecords);
                const results = await PlaceCache.findAll({ where: { destination_id: destRecord.id } });
                return res.json({ destination: destRecord, places: results, verified: true });
            }
            // --- END INSTANT RESOLVE ---


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
                await destRecord.update({
                    latitude: coords.lat,
                    longitude: coords.lon,
                    last_updated: new Date()
                });
            }

            let poiList = [];
            try {
                poiList = await osmService.fetchNearbyPlaces(coords.lat, coords.lon);
            } catch (poiError) {
                console.warn('POI Fetch failed, using popular fallbacks if available:', poiError.message);
            }

            // High-Quality Fallbacks for popular cities if API fails or returns too few results
            if (poiList.length < 5) {
                const fallbacks = {
                    'Delhi': [
                        { name: 'Red Fort', category: 'attraction', latitude: 28.6562, longitude: 77.2410, tags: { 'addr:suburb': 'Old Delhi', 'historic': 'monument' } },
                        { name: 'India Gate', category: 'attraction', latitude: 28.6129, longitude: 77.2295, tags: { 'addr:suburb': 'New Delhi' } },
                        { name: 'Qutub Minar', category: 'attraction', latitude: 28.5245, longitude: 77.1855, tags: { 'addr:suburb': 'Mehrauli' } },
                        { name: 'Lotus Temple', category: 'attraction', latitude: 28.5535, longitude: 77.2588, tags: { 'addr:suburb': 'Kalkaji' } },
                        { name: 'Chandni Chowk', category: 'market', latitude: 28.6608, longitude: 77.2300, tags: { 'addr:suburb': 'Old Delhi' } }
                    ],
                    'Mumbai': [
                        { name: 'Gateway of India', category: 'attraction', latitude: 18.9220, longitude: 72.8347, tags: { 'addr:suburb': 'Colaba' } },
                        { name: 'Marine Drive', category: 'attraction', latitude: 18.9431, longitude: 72.8230, tags: { 'addr:suburb': 'Nariman Point' } },
                        { name: 'Elephanta Caves', category: 'attraction', latitude: 18.9633, longitude: 72.9315, tags: { 'historic': 'monument' } },
                        { name: 'Juhu Beach', category: 'beach', latitude: 19.1067, longitude: 72.8260, tags: { 'addr:suburb': 'Juhu' } }
                    ],
                    'Goa': [
                        { name: 'Baga Beach', category: 'beach', latitude: 15.5553, longitude: 73.7517, tags: { 'addr:suburb': 'North Goa' } },
                        { name: 'Basilica of Bom Jesus', category: 'temple', latitude: 15.5009, longitude: 73.9116, tags: { 'addr:suburb': 'Old Goa' } },
                        { name: 'Dudhsagar Falls', category: 'gem', latitude: 15.3144, longitude: 74.3142, tags: { 'natural': 'waterfall' } }
                    ],
                    'Paris': [
                        { name: 'Eiffel Tower', category: 'attraction', latitude: 48.8584, longitude: 2.2945, tags: { 'historic': 'monument', 'tourism': 'attraction' } },
                        { name: 'Louvre Museum', category: 'museum', latitude: 48.8606, longitude: 2.3376, tags: { 'tourism': 'museum' } },
                        { name: 'Notre-Dame Cathedral', category: 'attraction', latitude: 48.8530, longitude: 2.3499, tags: { 'amenity': 'place_of_worship' } },
                        { name: 'Arc de Triomphe', category: 'attraction', latitude: 48.8738, longitude: 2.2950, tags: { 'historic': 'monument' } },
                        { name: 'Sacré-Cœur', category: 'attraction', latitude: 48.8867, longitude: 2.3431, tags: { 'amenity': 'place_of_worship' } }
                    ],
                    'London': [
                        { name: 'Big Ben', category: 'attraction', latitude: 51.5007, longitude: -0.1246, tags: { 'historic': 'monument' } },
                        { name: 'London Eye', category: 'attraction', latitude: 51.5033, longitude: -0.1195, tags: { 'tourism': 'attraction' } },
                        { name: 'Tower Bridge', category: 'attraction', latitude: 51.5055, longitude: -0.0754, tags: { 'historic': 'monument' } },
                        { name: 'British Museum', category: 'museum', latitude: 51.5194, longitude: -0.1270, tags: { 'tourism': 'museum' } },
                        { name: 'Buckingham Palace', category: 'attraction', latitude: 51.5014, longitude: -0.1419, tags: { 'historic': 'palace' } }
                    ],
                    'Bangalore': [
                        { name: 'Lalbagh Botanical Garden', category: 'attraction', latitude: 12.9507, longitude: 77.5848, tags: { 'leisure': 'garden' } },
                        { name: 'Cubbon Park', category: 'attraction', latitude: 12.9733, longitude: 77.5921, tags: { 'leisure': 'park' } },
                        { name: 'Bangalore Palace', category: 'attraction', latitude: 12.9988, longitude: 77.5920, tags: { 'historic': 'palace' } },
                        { name: 'ISKCON Temple', category: 'temple', latitude: 13.0098, longitude: 77.5511, tags: { 'amenity': 'place_of_worship' } }
                    ],
                    'Manali': [
                        { name: 'Solang Valley', category: 'attraction', latitude: 32.3166, longitude: 77.1578, tags: { 'tourism': 'attraction' } },
                        { name: 'Hadimba Temple', category: 'temple', latitude: 32.2483, longitude: 77.1892, tags: { 'amenity': 'place_of_worship' } },
                        { name: 'Rohtang Pass', category: 'attraction', latitude: 32.3716, longitude: 77.2466, tags: { 'historic': 'monument' } }
                    ],
                    'Dubai': [
                        { name: 'Burj Khalifa', category: 'attraction', latitude: 25.1972, longitude: 55.2744, tags: { 'tourism': 'attraction' } },
                        { name: 'Dubai Mall', category: 'market', latitude: 25.1985, longitude: 55.2796, tags: { 'shop': 'mall' } },
                        { name: 'Palm Jumeirah', category: 'beach', latitude: 25.1124, longitude: 55.1390, tags: { 'natural': 'beach' } }
                    ],
                    'Tokyo': [
                        { name: 'Shibuya Crossing', category: 'attraction', latitude: 35.6595, longitude: 139.7005, tags: { 'tourism': 'attraction' } },
                        { name: 'Tokyo Tower', category: 'attraction', latitude: 35.6586, longitude: 139.7454, tags: { 'historic': 'monument' } },
                        { name: 'Senso-ji Temple', category: 'temple', latitude: 35.7148, longitude: 139.7967, tags: { 'amenity': 'place_of_worship' } }
                    ],
                    'New York': [
                        { name: 'Times Square', category: 'attraction', latitude: 40.7580, longitude: -73.9855, tags: { 'tourism': 'attraction' } },
                        { name: 'Central Park', category: 'attraction', latitude: 40.7812, longitude: -73.9665, tags: { 'leisure': 'park' } },
                        { name: 'Statue of Liberty', category: 'attraction', latitude: 40.6892, longitude: -74.0445, tags: { 'historic': 'monument' } }
                    ],
                    'Pune': [
                        { name: 'Shaniwar Wada', category: 'attraction', latitude: 18.5194, longitude: 73.8553, tags: { 'historic': 'monument' } },
                        { name: 'Aga Khan Palace', category: 'attraction', latitude: 18.5523, longitude: 73.9015, tags: { 'historic': 'monument' } },
                        { name: 'Dagadusheth Halwai Ganapati Temple', category: 'temple', latitude: 18.5164, longitude: 73.8559, tags: { 'amenity': 'place_of_worship' } },
                        { name: 'Sinhagad Fort', category: 'attraction', latitude: 18.3663, longitude: 73.7559, tags: { 'historic': 'monument' } },
                        { name: 'Osho Teerth Park', category: 'attraction', latitude: 18.5356, longitude: 73.8879, tags: { 'leisure': 'park' } }
                    ],
                    'Kerala': [
                        { name: 'Alleppey Backwaters', category: 'attraction', latitude: 9.4981, longitude: 76.3388, tags: { 'tourism': 'attraction' } },
                        { name: 'Munnar Tea Gardens', category: 'attraction', latitude: 10.0889, longitude: 77.0595, tags: { 'natural': 'wood' } },
                        { name: 'Wayanad Wildlife Sanctuary', category: 'attraction', latitude: 11.6667, longitude: 76.2500, tags: { 'leisure': 'nature_reserve' } },
                        { name: 'Fort Kochi', category: 'attraction', latitude: 9.9667, longitude: 76.2411, tags: { 'historic': 'district' } },
                        { name: 'Varkala Beach', category: 'beach', latitude: 8.7333, longitude: 76.7167, tags: { 'natural': 'beach' } }
                    ]
                };

                
                const cityKey = Object.keys(fallbacks).find(k => destination.toLowerCase().includes(k.toLowerCase()));
                if (cityKey) {
                    poiList = [...poiList, ...fallbacks[cityKey]];
                }
            }

            await PlaceCache.destroy({ where: { destination_id: destRecord.id } });
            const placeRecords = poiList.map(p => {
                // Generative dynamic fields
                const bestTimes = ['Early Morning', 'Morning to Afternoon', 'Late Afternoon', 'Evening', 'Sunset', 'Anytime'];
                const bestTime = bestTimes[Math.floor(Math.random() * bestTimes.length)];
                
                let budget = '₹' + (Math.floor(Math.random() * 1500) + 300);
                if (p.category === 'hotel') budget = '₹' + (Math.floor(Math.random() * 8000) + 2000) + ' / night';
                if (p.category === 'beach' || p.category === 'temple') budget = 'Free or Nominal Entry';

                // Suitability logic based on category
                const suitabilityMap = {
                    'attraction': 'Family & Sightseeing',
                    'museum': 'Educational & Family',
                    'temple': 'Family & Peace',
                    'beach': 'Relaxation & Friends',
                    'food': 'Foodies & Friends',
                    'hotel': 'Couples & Solo',
                    'market': 'Solo & Shopping',
                    'gem': 'Adventure & Solo',
                    'other': 'Explore Solo'
                };
                const suitability = suitabilityMap[p.category] || 'General Visit';

                // Address extraction (Short area name)
                const tags = p.tags || {};
                const shortAddress = tags['addr:suburb'] || tags['addr:neighbourhood'] || tags['addr:quarter'] || destination;

                // City-Specific Signature Food Logic
                const signatureFoods = {
                    'Delhi': ['Chole Bhature', 'Butter Chicken', 'Paranthas', 'Aloo Chaat'],
                    'Mumbai': ['Vada Pav', 'Pav Bhaji', 'Misal Pav', 'Keema Pav'],
                    'Goa': ['Fish Curry Rice', 'Pork Vindaloo', 'Bebinca', 'Seafood'],
                    'Jaipur': ['Dal Baati Churma', 'Laal Maas', 'Ghevar', 'Pyaz Kachori'],
                    'Agra': ['Petha', 'Bedai & Jalebi', 'Mughlai Cuisine'],
                    'Kolkata': ['Rosogolla', 'Mishti Doi', 'Kati Roll', 'Fish Alur Dom'],
                    'Bangalore': ['Masala Dosa', 'Filter Coffee', 'Bisi Bele Bath', 'Donne Biryani'],
                    'Manali': ['Siddu', 'Trout Fish', 'Thukpa'],
                    'Rishikesh': ['Aloo Puri', 'Lassi', 'Ayurvedic Thali'],
                    'Leh-Ladakh': ['Thukpa', 'Momos', 'Butter Tea', 'Skyu'],
                    'Bangkok': ['Pad Thai', 'Mango Sticky Rice', 'Tom Yum'],
                    'Dubai': ['Shawarma', 'Kunafa', 'Arabic Mixed Grill'],
                    'Singapore': ['Chilli Crab', 'Chicken Rice', 'Laksa'],
                    'Tokyo': ['Sushi', 'Ramen', 'Takoyaki'],
                    'Bali': ['Nasi Goreng', 'Satay', 'Babi Guling'],
                    'Kuala Lumpur': ['Nasi Lemak', 'Roti Canai', 'Laksa'],
                    'Istanbul': ['Baklava', 'Doner Kebab', 'Turkish Delight'],
                    'Paris': ['Croissant', 'Macarons', 'Escargot'],
                    'London': ['Fish and Chips', 'English Breakfast', 'Sticky Toffee Pudding'],
                    'Rome': ['Carbonara', 'Gelato', 'Margherita Pizza'],
                    'Barcelona': ['Paella', 'Tapas', 'Churros'],
                    'Amsterdam': ['Stroopwafel', 'Dutch Fries', 'Raw Herring'],
                    'New York': ['NY Pizza', 'Bagel', 'Cheesecake'],
                    'Los Angeles': ['Tacos', 'In-N-Out Burger', 'Sushi Rolls'],
                    'Las Vegas': ['Buffet Dinner', 'Steak', 'Shrimp Cocktail'],
                    'Pune': ['Misal Pav', 'Puran Poli', 'Bhakari', 'Batata Vada'],
                    'Kerala': ['Appam with Stew', 'Kerala Prawn Curry', 'Idiyappam', 'Malabar Biryani']
                };


                const cityKey = Object.keys(signatureFoods).find(k => destination.toLowerCase().includes(k.toLowerCase()));
                const dishes = signatureFoods[cityKey] || ['Local Special Dish', 'Seasonal Specialty'];
                const randomDish = dishes[Math.floor(Math.random() * dishes.length)];

                let finalName = p.name;
                if (p.category === 'food' || p.tags.amenity === 'restaurant') {
                    finalName = `Famous ${randomDish} @ ${p.name}`;
                }

                return {
                    destination_id: destRecord.id,
                    place_name: finalName,
                    category: p.category,
                    latitude: p.latitude,
                    longitude: p.longitude,
                    description: `Experience the authentic taste of ${randomDish} at this highly rated spot in ${shortAddress}.`,
                    rating: (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1), // Higher base rating
                    image_url: `https://loremflickr.com/800/600/${encodeURIComponent(destination)},${encodeURIComponent(p.category || 'food')}/all/?lock=${Math.floor(Math.random() * 1000)}`,
                    best_time_to_visit: bestTime,
                    estimated_budget: budget,
                    suitability: suitability,
                    address: shortAddress,
                    last_updated: new Date()
                };
            });

            await PlaceCache.bulkCreate(placeRecords);
            const savedPlaces = await PlaceCache.findAll({ where: { destination_id: destRecord.id } });

            res.json({ destination: destRecord, places: savedPlaces });
        } catch (error) {
            console.error('Search Destination Error:', error.message);
            res.status(500).json({ error: 'Failed to search destination. Please check the city name.' });
        }
    },

    /**
     * Generate an optimized trip plan.
     */
    async getTripPlan(req, res) {
        const { destination, tripType, budget, duration } = req.body;

        try {
            const destRecord = await Destination.findOne({
                where: { name: { [Op.like]: `%${destination}%` } }
            });

            if (!destRecord) {
                return res.status(404).json({ error: 'Destination details not found. Please search first.' });
            }

            const places = await PlaceCache.findAll({ where: { destination_id: destRecord.id } });
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

    /**
     * Get saved trips for a user.
     */
    async getSavedTrips(req, res) {
        const { userId } = req.params;
        try {
            const savedTrips = await UserSavedTrip.findAll({
                where: { user_id: userId }
            });
            res.json(savedTrips);
        } catch (error) {
            console.error('Get Saved Trips Error:', error.message);
            res.status(500).json({ error: 'Failed to retrieve saved trips' });
        }
    },

    /**
     * Get specific category items from cache.
     */
    async getByCategory(req, res) {
        const { destination, category } = req.query;
        if (!destination || !category) {
            return res.status(400).json({ error: 'Destination and category are required' });
        }

        try {
            const destRecord = await Destination.findOne({
                where: { name: { [Op.like]: `%${destination}%` } }
            });

            if (!destRecord) {
                return res.status(404).json({ error: 'Destination not found in cache.' });
            }

            const items = await PlaceCache.findAll({
                where: {
                    destination_id: destRecord.id,
                    category: category
                }
            });

            res.json(items);
        } catch (error) {
            console.error(`Get ${category} Error:`, error.message);
            res.status(500).json({ error: `Failed to retrieve ${category}` });
        }
    },

    /**
     * Get all map points for a destination.
     */
    async getMapPoints(req, res) {
        const { destination } = req.query;
        if (!destination) {
            return res.status(400).json({ error: 'Destination is required' });
        }

        try {
            const destRecord = await Destination.findOne({
                where: { name: { [Op.like]: `%${destination}%` } }
            });

            if (!destRecord) return res.status(404).json({ error: 'Destination not found' });

            const points = await PlaceCache.findAll({
                where: { destination_id: destRecord.id }
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
