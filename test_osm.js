const osmService = require('./backend/services/osmService');

async function test() {
    try {
        console.log('Testing Geocoding for Pune...');
        const coords = await osmService.getCoordinates('Pune');
        console.log('Coordinates:', coords);
        
        console.log('Testing POI Fetch for Pune...');
        const pois = await osmService.fetchNearbyPlaces(coords.lat, coords.lon);
        console.log(`Found ${pois.length} POIs`);
    } catch (err) {
        console.error('Test Failed:', err.message);
    }
}

test();
