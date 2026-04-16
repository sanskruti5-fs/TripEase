const Destination = require('../models/Destination');
const PlaceCache = require('../models/PlaceCache');
const nominatimService = require('../services/nominatimService');
const overpassService = require('../services/overpassService');
const { Op } = require('sequelize');

/**
 * Destination Controller
 */
const destinationController = {
    /**
     * Handles searching for a destination.
     * Caches data if not updated within 24 hours.
     */
    async searchDestination(req, res) {
        const { destination } = req.body;
        if (!destination) {
            return res.status(400).json({ error: 'Destination is required' });
        }

        try {
            // Check cache for destination
            let destRecord = await Destination.findOne({
                where: { name: { [Op.like]: `%${destination}%` } }
            });

            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // If destination exists and updated within 24h, return it
            if (destRecord && destRecord.last_updated > twentyFourHoursAgo) {
                const places = await PlaceCache.findAll({ where: { destination_id: destRecord.id } });
                return res.json({ destination: destRecord, places });
            }

            // Otherwise, fetch fresh data
            console.log('Fetching fresh data for:', destination);
            const coords = await nominatimService.getCoordinates(destination);
            
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

            // Fetch POIs from Overpass
            const poiList = await overpassService.fetchNearbyPlaces(coords.lat, coords.lon);

            // Update POI cache
            await PlaceCache.destroy({ where: { destination_id: destRecord.id } });
            const placeRecords = poiList.map(p => ({
                destination_id: destRecord.id,
                place_name: p.name,
                category: p.category,
                latitude: p.latitude,
                longitude: p.longitude,
                description: `A ${p.category} in ${destination}`, // Dynamic description could be improved
                rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1), // Mock rating
                last_updated: new Date()
            }));

            await PlaceCache.bulkCreate(placeRecords);
            const savedPlaces = await PlaceCache.findAll({ where: { destination_id: destRecord.id } });

            res.json({ destination: destRecord, places: savedPlaces });
        } catch (error) {
            console.error('Search Destination Error:', error.message);
            if (error.response?.status === 403) {
                return res.status(503).json({ error: 'API Access temporarily blocked by provider. Please try again later.' });
            }
            if (error.message === 'Destination not found') {
                return res.status(404).json({ error: 'Could not find destination. Please check the spelling or try a more specific location.' });
            }
            res.status(500).json({ error: 'Internal server error while searching destination.' });
        }
    }
};

module.exports = destinationController;
