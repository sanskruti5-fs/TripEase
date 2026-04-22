const fs = require('fs');
const path = require('path');

const targetCities = [
    'udaipur', 'singapore', 'rome', 'mumbai', 'los-angeles', 'leh-ladakh',
    'kuala-lumpur', 'las-vegas', 'kolkata', 'kochi', 'chennai', 'bengaluru',
    'barcelona', 'amsterdam', 'agra'
];

const baseDir = 'c:\\TripEase\\frontend\\public\\images';
const jsonPath = 'c:\\TripEase\\frontend\\src\\data\\itineraryData.json';

function getSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

console.log('--- Start ---');

for (const city of targetCities) {
    const cityPath = path.join(baseDir, city);
    const placesPath = path.join(cityPath, 'places');

    if (fs.existsSync(cityPath)) {
        if (!fs.existsSync(placesPath)) {
            fs.mkdirSync(placesPath, { recursive: true });
            console.log('Created: ' + placesPath);
        }

        const files = fs.readdirSync(cityPath);
        files.forEach(file => {
            if (file.toLowerCase().endsWith('.jpg') && !file.toLowerCase().includes('hero')) {
                const oldPath = path.join(cityPath, file);
                const newPath = path.join(placesPath, file);
                try {
                    fs.renameSync(oldPath, newPath);
                    console.log('Moved: ' + file);
                } catch (e) {}
            }
        });
    }
}

if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    for (const cityName in data.destinations) {
        const citySlug = getSlug(cityName);
        if (data.destinations[cityName].places) {
            data.destinations[cityName].places.forEach(place => {
                const placeSlug = getSlug(place.name);
                place.image = '/images/' + citySlug + '/places/' + placeSlug + '.jpg';
            });
        }
    }
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 4), 'utf8');
    console.log('Updated JSON');
}

console.log('--- End ---');
