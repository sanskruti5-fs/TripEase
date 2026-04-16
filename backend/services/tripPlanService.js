/**
 * Trip Plan Generation Service
 * Intelligent filtering and itinerary generation.
 */
const tripPlanService = {
    /**
     * Generate an optimized travel plan.
     * @param {string} destination - Destination name
     * @param {string} tripType - Trip type (family, solo, luxury, adventure, couple)
     * @param {number} budget - Budget in ₹
     * @param {number} duration - Trip duration in days
     * @param {Array} places - List of POIs from Overpass
     * @returns {object}
     */
    generatePlan(destination, tripType, budget, duration, places) {
        // Group places by category
        const categorized = {
            attractions: places.filter(p => p.category === 'attraction' || p.category === 'beach' || p.category === 'gem' || p.category === 'temple'),
            food: places.filter(p => p.category === 'food'),
            hotels: places.filter(p => p.category === 'hotel'),
            markets: places.filter(p => p.category === 'market'),
            emergency: places.filter(p => p.category === 'emergency'),
            transport: places.filter(p => p.category === 'transport')
        };

        // Filter attractions based on trip type
        let filteredAttractions = Array.from(categorized.attractions);
        if (tripType === 'family') {
            filteredAttractions = filteredAttractions.filter(p => p.category !== 'gem'); // prefer established spots
        } else if (tripType === 'adventure') {
            filteredAttractions = filteredAttractions.filter(p => p.category === 'gem' || p.category === 'beach');
        } else if (tripType === 'solo') {
            filteredAttractions = filteredAttractions.sort(() => 0.5 - Math.random()); // variety for solo
        }

        // Itinerary generation logic (distribute attractions across days)
        const itinerary = [];
        const itemsPerDay = Math.ceil(filteredAttractions.length / duration);
        
        for (let i = 0; i < duration; i++) {
            const dayPlaces = filteredAttractions.splice(0, Math.min(3, itemsPerDay)); // cap at 3 places per day for balance
            itinerary.push({
                day: i + 1,
                title: `Day ${i + 1} - Exploring ${dayPlaces.length > 0 ? dayPlaces[0].name : 'Highlights'}`,
                activities: dayPlaces.map(p => ({
                    name: p.name,
                    category: p.category,
                    latitude: p.latitude,
                    longitude: p.longitude,
                    suggestion: this.getSuggestion(p.category)
                }))
            });
        }

        return {
            destination,
            trip_details: { tripType, budget, duration },
            itinerary,
            recommendations: {
                food: categorized.food.slice(0, 6),
                hotels: categorized.hotels.slice(0, 5),
                markets: categorized.markets.slice(0, 4)
            },
            essentials: {
                emergency: categorized.emergency.slice(0, 3),
                transport: categorized.transport.slice(0, 4)
            }
        };
    },

    /**
     * Map suggestions to place categories.
     * @param {string} category 
     * @returns {string}
     */
    getSuggestion(category) {
        const suggestions = {
            attraction: 'Highly recommended for its historical importance.',
            beach: 'Perfect for a relaxing afternoon.',
            gem: 'A hidden gem locals love. Great for photos.',
            temple: 'Serene place of worship. Respect local customs.',
            food: 'Must-try local delicacy available here.',
            market: 'Great place to pick up unique souvenirs.'
        };
        return suggestions[category] || 'A great spot to visit.';
    }
};

module.exports = tripPlanService;
