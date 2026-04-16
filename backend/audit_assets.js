const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '../frontend/src/data/itineraryData.json');

function auditAssets() {
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const destinations = data.destinations;
    const downloadQueue = [];

    Object.keys(destinations).forEach(city => {
        const dest = destinations[city];
        const citySlug = city.toLowerCase().replace(/\s+/g, '-');

        // Check places
        if (dest.places) {
            dest.places.forEach(p => {
                if (p.image && p.image.startsWith('http')) {
                    const filename = p.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.jpg';
                    downloadQueue.push({
                        city: citySlug,
                        name: p.name,
                        url: p.image,
                        localPath: `/images/${citySlug}/${filename}`,
                        absPath: path.join(__dirname, `../frontend/public/images/${citySlug}/${filename}`)
                    });
                }
            });
        }

        // Check food
        if (dest.food) {
            dest.food.forEach(f => {
                if (f.image && f.image.startsWith('http')) {
                    const filename = f.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.jpg';
                    downloadQueue.push({
                        city: citySlug,
                        name: f.name,
                        url: f.image,
                        localPath: `/images/${citySlug}/${filename}`,
                        absPath: path.join(__dirname, `../frontend/public/images/${citySlug}/${filename}`)
                    });
                }
            });
        }

        // Check markets
        if (dest.markets) {
            dest.markets.forEach(m => {
                if (m.image && m.image.startsWith('http')) {
                    const filename = m.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.jpg';
                    downloadQueue.push({
                        city: citySlug,
                        name: m.name,
                        url: m.image,
                        localPath: `/images/${citySlug}/${filename}`,
                        absPath: path.join(__dirname, `../frontend/public/images/${citySlug}/${filename}`)
                    });
                }
            });
        }
    });

    console.log(JSON.stringify(downloadQueue, null, 2));
}

auditAssets();
