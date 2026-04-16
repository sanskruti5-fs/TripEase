const axios = require('axios');

/**
 * Overpass API Service
 * Fetches nearby places based on coordinates.
 */
const overpassService = {
    /**
     * Fetch nearby places of interest.
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {number} radius - Radius in meters (default 10km)
     * @returns {Promise<Array>}
     */
    async fetchNearbyPlaces(lat, lon, radius = 10000) {
        const query = `
            [out:json][timeout:25];
            (
                node["tourism"="attraction"](around:${radius},${lat},${lon});
                node["historic"](around:${radius},${lat},${lon});
                node["natural"="beach"](around:${radius},${lat},${lon});
                node["amenity"="restaurant"](around:${radius},${lat},${lon});
                node["amenity"="cafe"](around:${radius},${lat},${lon});
                node["amenity"="fast_food"](around:${radius},${lat},${lon});
                node["shop"](around:${radius},${lat},${lon});
                node["amenity"="marketplace"](around:${radius},${lat},${lon});
                node["amenity"="place_of_worship"](around:${radius},${lat},${lon});
                node["amenity"="hospital"](around:${radius},${lat},${lon});
                node["amenity"="bus_station"](around:${radius},${lat},${lon});
                node["railway"="station"](around:${radius},${lat},${lon});
                node["tourism"="hotel"](around:${radius},${lat},${lon});
                node["tourism"="viewpoint"](around:${radius},${lat},${lon});
                node["tourism"="museum"](around:${radius},${lat},${lon});
            );
            out body;
            >;
            out skel qt;
        `;

        try {
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'TripEase-Travel-Planner-V1.0 (contact@tripease-app.online)',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                timeout: 30000 // 30s timeout for complex queries
            });

            if (response.data && response.data.elements) {
                return response.data.elements.map(el => ({
                    name: el.tags.name || 'Unnamed Place',
                    category: this.mapCategory(el.tags),
                    latitude: el.lat,
                    longitude: el.lon,
                    tags: el.tags,
                    osm_id: el.id
                })).filter(p => p.name !== 'Unnamed Place');
            }
            return [];
        } catch (error) {
            console.error('Overpass API Error:', error.message);
            // Retry logic could be added here if needed
            throw error;
        }
    },

    /**
     * Map OSM tags to application categories.
     * @param {object} tags - OSM tags
     * @returns {string}
     */
    mapCategory(tags) {
        if (tags.tourism === 'hotel' || tags.tourism === 'hostel') return 'hotel';
        if (tags.amenity === 'restaurant' || tags.amenity === 'cafe' || tags.amenity === 'fast_food') return 'food';
        if (tags.tourism === 'attraction' || tags.historic || tags.tourism === 'museum') return 'attraction';
        if (tags.natural === 'beach') return 'beach';
        if (tags.shop || tags.amenity === 'marketplace') return 'market';
        if (tags.amenity === 'place_of_worship') return 'temple';
        if (tags.amenity === 'hospital' || tags.amenity === 'clinic') return 'emergency';
        if (tags.amenity === 'bus_station' || tags.railway === 'station') return 'transport';
        if (tags.tourism === 'viewpoint') return 'gem';
        return 'other';
    }
};

module.exports = overpassService;
