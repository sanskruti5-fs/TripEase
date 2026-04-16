const fs = require('fs');
const path = require('path');

/**
 * Loads the verified itinerary data from the frontend directory.
 */
function getVerifiedData() {
    try {
        const filePath = path.join(__dirname, '../../frontend/src/data/itineraryData.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return data.destinations;
        }
        return null;
    } catch (err) {
        console.error('Error loading verified data:', err.message);
        return null;
    }
}

/**
 * Checks if a city is in our verified list and returns its data if found.
 */
function checkVerifiedCity(cityName) {
    const destinations = getVerifiedData();
    if (!destinations) return null;

    // Search for the city name (case-insensitive and partial match)
    const matchedKey = Object.keys(destinations).find(k => 
        k.toLowerCase() === cityName.toLowerCase() || 
        cityName.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(cityName.toLowerCase())
    );

    if (matchedKey) {
        return {
            name: matchedKey,
            data: destinations[matchedKey]
        };
    }
    return null;
}

module.exports = { checkVerifiedCity };
