const PlaceCache = require('../models/PlaceCache');
const Destination = require('../models/Destination');
const { Op } = require('sequelize');

/**
 * Place Controller
 */
const placeController = {
    /**
     * Get specific category items from cache.
     */
    async getByCategory(req, res, category) {
        const { destination } = req.query;
        if (!destination) {
            return res.status(400).json({ error: 'Destination is required' });
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

    async getHotels(req, res) {
        return placeController.getByCategory(req, res, 'hotel');
    },

    async getFood(req, res) {
        return placeController.getByCategory(req, res, 'food');
    },

    async getMarkets(req, res) {
        return placeController.getByCategory(req, res, 'market');
    },

    async getEmergencyServices(req, res) {
        return placeController.getByCategory(req, res, 'emergency');
    },

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

module.exports = placeController;
