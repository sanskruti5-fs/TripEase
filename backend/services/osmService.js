const axios = require('axios');

/**
 * OpenStreetMap Service (Nominatim + Overpass)
 * Handles geocoding and POI fetching for the free core.
 */
const osmService = {
    /**
     * Get coordinates for a given destination name.
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
    },

    /**
     * Fetch nearby places of interest.
     */
    async fetchNearbyPlaces(lat, lon, radius = 8000) {
        const query = `
            [out:json][timeout:25];
            (
                nwr["tourism"~"attraction|hotel|museum|viewpoint"](around:${radius},${lat},${lon});
                nwr["historic"](around:${radius},${lat},${lon});
                nwr["natural"="beach"](around:${radius},${lat},${lon});
                nwr["amenity"~"restaurant|cafe|fast_food|marketplace|place_of_worship|hospital|bus_station"](around:${radius},${lat},${lon});
                nwr["shop"](around:${radius},${lat},${lon});
                nwr["railway"="station"](around:${radius},${lat},${lon});
            );
            out center 100;
            >;
            out skel qt;
        `;

        const servers = [
            'https://overpass-api.de/api/interpreter',
            'https://lz4.overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter'
        ];

        let lastError = null;
        for (const server of servers) {
            let retries = 2;
            while (retries > 0) {
                try {
                    console.log(`Fetching from ${server} (Retries left: ${retries})...`);
                    const url = `${server}?data=${encodeURIComponent(query)}`;
                    const response = await axios.get(url, {
                        headers: {
                            'User-Agent': 'TripEase-Travel-Planner-V1.0 (contact@tripease-app.online)',
                            'Accept-Language': 'en-US,en;q=0.9'
                        },
                        timeout: 30000 // Increased timeout to 30s
                    });

                    if (response.data && response.data.elements) {
                        const results = response.data.elements.map(el => ({
                            id: el.id,
                            name: el.tags.name || 'Unnamed Place',
                            category: this.mapCategory(el.tags),
                            latitude: el.lat || (el.center && el.center.lat),
                            longitude: el.lon || (el.center && el.center.lon),
                            tags: el.tags
                        })).filter(p => p.name !== 'Unnamed Place' && p.latitude && p.longitude);
                        
                        if (results.length > 0) return results;
                    }
                } catch (error) {
                    console.error(`Overpass API Error (${server}):`, error.message);
                    lastError = error;
                    retries--;
                    if (retries > 0) await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
                }
            }
        }

        
        throw lastError || new Error('All Overpass servers failed');
    },

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

module.exports = osmService;
