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

            // --- AI DATA FETCH FOR ALL OTHER CITIES ---
            console.log(`🤖 Fetching AI details for: ${destination}`);
            
            const groqKey = process.env.GROQ_API_KEY;
            if (!groqKey) throw new Error('Groq API Key missing');

            const aiPrompt = `
                Act as a local travel expert for ${destination}. Generate a comprehensive list of 12-15 travel data points.
                You MUST return exactly 3 types of data: "attractions", "food", and "markets".
                
                RULES:
                1. Entry fees must be in INR (₹). If it's outside India, estimate the equivalent in INR.
                2. Be realistic. Use real locations in ${destination}.
                3. Each attraction must have a "name", "description", "entryFee" (number), and "suitability".
                4. Each food item must have a "name", "dish", "restaurant", and "description".
                5. Each market must have a "name", "specialty", and "description".
                
                RETURN ONLY VALID JSON:
                {
                  "attractions": [{ "name": "...", "description": "...", "entryFee": 500, "suitability": "Family" }],
                  "food": [{ "name": "Dish Name @ Restaurant Name", "description": "..." }],
                  "markets": [{ "name": "...", "specialty": "...", "description": "..." }]
                }
            `;

            const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [{ role: 'user', content: aiPrompt }],
                    response_format: { type: "json_object" }
                })
            });

            const aiData = await aiResponse.json();
            const aiContent = JSON.parse(aiData.choices[0].message.content);

            if (!destRecord) {
                destRecord = await Destination.create({
                    name: destination,
                    latitude: 0,
                    longitude: 0,
                    last_updated: new Date()
                });
            }

            await PlaceCache.deleteMany({ destination_id: destRecord._id });

            const allItems = [
                ...(aiContent.attractions || []).map(a => ({ ...a, category: 'attraction' })),
                ...(aiContent.food || []).map(f => ({ ...f, category: 'food' })),
                ...(aiContent.markets || []).map(m => ({ ...m, category: 'market' }))
            ];

            const placeRecords = allItems.map((p, idx) => ({
                destination_id: destRecord._id,
                place_name: p.name,
                category: p.category,
                latitude: 0,
                longitude: 0,
                description: p.description || 'Great local spot.',
                rating: (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1),
                image_url: `https://loremflickr.com/800/600/${encodeURIComponent(destination)},${encodeURIComponent(p.category)}/all/?lock=${idx}`,
                best_time_to_visit: 'Flexible',
                estimated_budget: p.entryFee ? `₹${p.entryFee}` : 'Variable',
                suitability: p.suitability || 'General',
                address: destination,
                last_updated: new Date()
            }));

            await PlaceCache.insertMany(placeRecords);
            const savedPlaces = await PlaceCache.find({ destination_id: destRecord._id });
            res.json({ destination: destRecord, places: savedPlaces, aiGenerated: true });
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
