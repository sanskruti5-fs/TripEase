const axios = require('axios');

/**
 * Nominatim API Geocoding Service
 * Converts destination names to latitude and longitude.
 */
const nominatimService = {
    /**
     * Get coordinates for a given destination name.
     * @param {string} destination - The name of the destination (e.g., "Paris", "Goa").
     * @returns {Promise<{lat: number, lon: number, displayName: string}>}
     */
    async getCoordinates(destination) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'TripEase-Travel-Planner-V1.0 (contact@tripease-app.online)',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                return {
                    lat: parseFloat(result.lat),
                    lon: parseFloat(result.lon),
                    displayName: result.display_name
                };
            }
            throw new Error('Destination not found');
        } catch (error) {
            console.error('Nominatim API Error:', error.message);
            throw error;
        }
    }
};

module.exports = nominatimService;
