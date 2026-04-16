const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config();

const Destination = require('./models/Destination');
const PlaceCache = require('./models/PlaceCache');

const JSON_PATH = path.join(__dirname, '../frontend/src/data/itineraryData.json');
const IMAGES_ROOT = path.join(__dirname, '../frontend/public/images');

const HOTEL_IMAGE_POOL = [
    '1566073771259-6a8506099945', '1582719478250-c89cae4dc85b',
    '1561501900-3701fa1a0c1e', '1542314831-068cd1dbfeeb',
    '1571896349842-33c89424de2d', '1551882547-ff43cce67fe3',
    '1520250497591-112f2f40a3f4', '1445013541996-8146177bf397',
    '1522771739844-6a9f6d5f14af', '1549389742-531dfbfd3c36'
];

function getHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

async function populateHotels() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log("🏨 Specialized Hotel Asset Population starting...");

    // 1. Process Database Hotels
    console.log("🗄️ Auditing PlaceCache for hotels...");
    const dbHotels = await PlaceCache.find({ category: 'hotel' }).populate('destinationId');

    console.log(`📦 Found ${dbHotels.length} hotels in database cache.`);

    for (let i = 0; i < dbHotels.length; i++) {
        const hotel = dbHotels[i];
        const cityName = hotel.destinationId?.name || 'unknown';
        const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');
        const hotelSlug = hotel.placeName.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
        const filename = `hotel-${hotelSlug}.jpg`;
        const cityDir = path.join(IMAGES_ROOT, citySlug);
        const absPath = path.join(cityDir, filename);
        const relPath = `/images/${citySlug}/${filename}`;

        if (!fs.existsSync(cityDir)) fs.mkdirSync(cityDir, { recursive: true });

        const needsLocal = !hotel.imageUrl || !hotel.imageUrl.startsWith('/images');
        if (needsLocal) {
            if (!fs.existsSync(absPath)) {
                const seedHash = getHash(`${cityName}-${hotel.placeName}`);
                const imageId = HOTEL_IMAGE_POOL[seedHash % HOTEL_IMAGE_POOL.length];
                const downloadUrl = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=800&q=80`;
                console.log(`[${i+1}/${dbHotels.length}] Localizing Hotel: ${hotel.placeName} (${cityName})`);
                try {
                    execSync(`curl.exe -L -k -s -o "${absPath}" "${downloadUrl}"`);
                } catch (err) {
                    console.error(`❌ Failed: ${hotel.placeName}`);
                }
            }
            await PlaceCache.findByIdAndUpdate(hotel._id, { imageUrl: relPath });
        }
    }

    // 2. Process JSON Hotels
    console.log("💾 Syncing itineraryData.json...");
    if (fs.existsSync(JSON_PATH)) {
        const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
        Object.keys(data.destinations).forEach(city => {
            const dest = data.destinations[city];
            if (dest.hotels) {
                dest.hotels.forEach(hotel => {
                    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
                    const hotelSlug = hotel.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
                    hotel.image = `/images/${citySlug}/hotel-${hotelSlug}.jpg`;
                });
            }
        });
        fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
    }

    console.log("✨ Hotel Diversification & Sync Complete!");
    await mongoose.connection.close();
}

populateHotels().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
