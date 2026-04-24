const hotelService = require('../services/hotelService');

const hotelController = {
    async getHotels(req, res) {
        const { city } = req.query;

        if (!city || !city.trim()) {
            return res.status(400).json({ error: 'city query parameter is required' });
        }

        try {
            const hotels = await hotelService.getHotels(city.trim());
            res.json(hotels);
        } catch (err) {
            console.error('[Hotel Controller Error]', err.message);
            res.status(500).json({ error: 'Failed to fetch hotels. Please try again.' });
        }
    }
};

module.exports = hotelController;
