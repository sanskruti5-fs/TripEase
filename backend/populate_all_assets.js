const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config();

const Destination = require('./models/Destination');
const PlaceCache = require('./models/PlaceCache');

const JSON_PATH = path.join(__dirname, '../frontend/src/data/itineraryData.json');
const IMAGES_ROOT = path.join(__dirname, '../frontend/public/images');

async function populateAssets() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const destinations = data.destinations;
    const downloadQueue = [];

    console.log("🔍 Auditing assets...");

    Object.keys(destinations).forEach(city => {
        const dest = destinations[city];
        const citySlug = city.toLowerCase().replace(/\s+/g, '-');
        const cityDir = path.join(IMAGES_ROOT, citySlug);

        const processItem = (item) => {
            if (item.image && item.image.startsWith('http')) {
                const cleanName = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const filename = `${cleanName}.jpg`;
                const absPath = path.join(cityDir, filename);
                const relPath = `/images/${citySlug}/${filename}`;
                downloadQueue.push({ city, citySlug, name: item.name, url: item.image, absPath, relPath, itemReference: item });
            }
        };

        if (dest.places) dest.places.forEach(p => processItem(p));
        if (dest.food) dest.food.forEach(f => processItem(f));
        if (dest.markets) dest.markets.forEach(m => processItem(m));
        if (dest.hotels) dest.hotels.forEach(h => processItem(h));
    });

    console.log(`📦 Found ${downloadQueue.length} assets to localise.`);

    const categoryMaps = {
        food: ['1546069901-ba9599a7e63c', '1512132411229-c30391241dd8', '1567620985035-0863200a48a3'],
        market: ['1533900298318-6b8da08a523e', '1488459739732-068fd246c3c5', '1506484334402-40f2cd067a82'],
        place: ['1502602898657-3e91760cbb34', '1518391846015-55a9cc003b25', '1513635269975-59663e0ac1ad'],
        hotel: ['1566073771259-6a8506099945', '1582719478250-c89cae4dc85b', '1561501900-3701fa1a0c1e']
    };

    for (let i = 0; i < downloadQueue.length; i++) {
        const item = downloadQueue[i];
        const dir = path.dirname(item.absPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        if (!fs.existsSync(item.absPath)) {
            try {
                const category = item.absPath.includes('food') ? 'food' :
                    item.absPath.includes('market') ? 'market' :
                    item.absPath.includes('hotel') ? 'hotel' : 'place';
                const ids = categoryMaps[category];
                let hash = 0;
                const seedStr = `${item.city}-${item.name}`;
                for (let j = 0; j < seedStr.length; j++) {
                    hash = ((hash << 5) - hash) + seedStr.charCodeAt(j);
                    hash |= 0;
                }
                const imageId = ids[Math.abs(hash) % ids.length];
                const downloadUrl = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=800&q=80`;
                console.log(`[${i+1}/${downloadQueue.length}] Downloading: ${item.name} (${item.city})`);
                execSync(`curl.exe -L -k -s -o "${item.absPath}" "${downloadUrl}"`);
            } catch (err) {
                console.error(`❌ Failed to download ${item.name}:`, err.message);
            }
        }
        item.itemReference.image = item.relPath;
    }

    // Save updated JSON
    console.log("💾 Saving updated itineraryData.json...");
    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));

    // Sync to MongoDB PlaceCache
    console.log("🗄️ Syncing PlaceCache in MongoDB...");
    for (const city of Object.keys(destinations)) {
        const dbDest = await Destination.findOne({ name: new RegExp(`^${city}$`, 'i') });
        if (!dbDest) continue;
        const dest = destinations[city];

        const syncItems = async (items) => {
            if (!items) return;
            for (const item of items) {
                await PlaceCache.findOneAndUpdate(
                    { destinationId: dbDest._id, placeName: item.name },
                    { imageUrl: item.image },
                    { new: true }
                );
            }
        };

        await syncItems(dest.places);
        await syncItems(dest.food);
        await syncItems(dest.markets);
    }

    console.log("✨ Global Asset Population & Sync Complete!");
    await mongoose.connection.close();
}

populateAssets().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
