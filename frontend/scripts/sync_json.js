const fs = require('fs');
const jsonPath = 'c:\\TripEase\\frontend\\src\\data\\itineraryData.json';

function getSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

console.log('Syncing itineraryData.json...');

if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw);
    const dests = data.destinations;

    for (const cityName in dests) {
        const citySlug = getSlug(cityName);
        const cityData = dests[cityName];
        if (cityData.places) {
            cityData.places.forEach(place => {
                const placeSlug = getSlug(place.name);
                place.image = `/images/${citySlug}/places/${placeSlug}.jpg`;
            });
        }
    }

    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 4), 'utf8');
    console.log('Successfully synced ' + Object.keys(dests).length + ' cities.');
} else {
    console.log('Error: File not found ' + jsonPath);
}
