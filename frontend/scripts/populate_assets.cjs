const fs = require('fs');
const path = require('path');
const https = require('https');

const ITINERARY_DATA = 'frontend/src/data/itineraryData.json';
const IMAGES_BASE = 'frontend/public/images';

const citiesToProcess = [
    'Udaipur', 'Singapore', 'Rome', 'Mumbai', 'Los Angeles', 'Leh-Ladakh', 
    'Kuala Lumpur', 'Las Vegas', 'Kolkata', 'Kochi', 'Chennai', 'Bengaluru', 
    'Barcelona', 'Amsterdam', 'Agra', 'Hyderabad', 'Varanasi', 'Manali', 
    'Rishikesh', 'Bangkok', 'Dubai', 'Tokyo', 'Bali', 'Istanbul', 'Paris', 'London'
];

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Handle redirect
                downloadImage(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function main() {
    console.log("Starting asset population...");
    const dataJSON = fs.readFileSync(ITINERARY_DATA, 'utf8');
    const data = JSON.parse(dataJSON);
    const destinations = data.destinations;

    for (const cityKey of citiesToProcess) {
        // Find the actual key in the JSON regardless of case
        const actualKey = Object.keys(destinations).find(k => k.toLowerCase() === cityKey.toLowerCase());
        if (!actualKey) {
            console.log(`City ${cityKey} not found in JSON.`);
            continue;
        }

        const cityData = destinations[actualKey];
        // Use the folder name as it appears in the image path (usually lowercase and hyphenated)
        const cityDirName = cityKey.toLowerCase().replace(/\s+/g, '-');
        const cityDir = path.join(IMAGES_BASE, cityDirName);

        if (!fs.existsSync(cityDir)) {
            fs.mkdirSync(cityDir, { recursive: true });
        }

        const items = [
            ...(cityData.places || []),
            ...(cityData.food || []),
            ...(cityData.markets || [])
        ];

        for (const item of items) {
            if (!item.image || !item.image.startsWith('/images/')) continue;

            // Extract the filename from the path in the JSON
            const filename = path.basename(item.image);
            const destPath = path.join(cityDir, filename);

            if (!fs.existsSync(destPath)) {
                console.log(`Downloading for ${actualKey}: ${item.name}...`);
                const query = encodeURIComponent(`${actualKey} ${item.name}`);
                // Using loremflickr as a more reliable source for free stock images
                const sourceUrl = `https://loremflickr.com/800/600/${query}`;
                
                try {
                    await downloadImage(sourceUrl, destPath);
                    console.log(`  Saved to ${destPath}`);
                } catch (e) {
                    console.error(`  Failed to download ${item.name}: ${e.message}`);
                }
            }
        }
    }
    console.log("Finished asset population.");
}

main().catch(console.error);
