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
    const data = JSON.parse(fs.readFileSync(ITINERARY_DATA, 'utf8'));
    const destinations = data.destinations;

    for (const cityKey of citiesToProcess) {
        if (!destinations[cityKey]) continue;

        const cityData = destinations[cityKey];
        const cityDir = path.join(IMAGES_BASE, cityKey.toLowerCase().replace(/\s+/g, '-'));

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

            const filename = path.basename(item.image);
            const destPath = path.join(cityDir, filename);

            if (!fs.existsSync(destPath)) {
                console.log(`Downloading for ${cityKey}: ${item.name}...`);
                const query = encodeURIComponent(`${cityKey} ${item.name}`);
                // Using unsplash random image for search query
                const url = `https://images.unsplash.com/photo-1548325852-870d0d82944b?auto=format&fit=crop&w=800&q=80`; // Placeholder if search fails
                
                // Real search logic would require API key. For this demo, let's use a curated search pattern if possible.
                // Since I can't easily search without an API key in a simple script, 
                // I'll use the 'source.unsplash.com' logic which is still functional for many.
                const sourceUrl = `https://source.unsplash.com/featured/800x600/?${query}`;
                
                try {
                    await downloadImage(sourceUrl, destPath);
                    console.log(`Saved to ${destPath}`);
                } catch (e) {
                    console.error(`Failed to download ${item.name}: ${e.message}`);
                }
            }
        }
    }
}

main().catch(console.error);
