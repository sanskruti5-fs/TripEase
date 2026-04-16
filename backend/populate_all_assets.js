const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Sequelize } = require('sequelize');

const JSON_PATH = path.join(__dirname, '../frontend/src/data/itineraryData.json');
const DB_PATH = path.join(__dirname, 'database.sqlite');
const IMAGES_ROOT = path.join(__dirname, '../frontend/public/images');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: DB_PATH,
    logging: false
});

async function populateAssets() {
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const destinations = data.destinations;
    const downloadQueue = [];

    console.log("🔍 Auditing assets...");

    Object.keys(destinations).forEach(city => {
        const dest = destinations[city];
        const citySlug = city.toLowerCase().replace(/\s+/g, '-');
        const cityDir = path.join(IMAGES_ROOT, citySlug);

        // Function to process items
        const processItem = (item, type) => {
            if (item.image && item.image.startsWith('http')) {
                const cleanName = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const filename = `${cleanName}.jpg`;
                const absPath = path.join(cityDir, filename);
                const relPath = `/images/${citySlug}/${filename}`;

                downloadQueue.push({
                    city,
                    citySlug,
                    name: item.name,
                    url: item.image,
                    absPath,
                    relPath,
                    itemReference: item // Link to original object for updating
                });
            }
        };

        if (dest.places) dest.places.forEach(p => processItem(p, 'place'));
        if (dest.food) dest.food.forEach(f => processItem(f, 'food'));
        if (dest.markets) dest.markets.forEach(m => processItem(m, 'market'));
        if (dest.hotels) dest.hotels.forEach(h => processItem(h, 'hotel'));
    });

    console.log(`📦 Found ${downloadQueue.length} assets to localise.`);

    // 1. Download missing images
    for (let i = 0; i < downloadQueue.length; i++) {
        const item = downloadQueue[i];
        const dir = path.dirname(item.absPath);
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!fs.existsSync(item.absPath)) {
            try {
                // Curated high-quality Unsplash IDs for a premium look
                const categoryMaps = {
                    food: [
                        '1546069901-ba9599a7e63c', '1512132411229-c30391241dd8', 
                        '1567620985035-0863200a48a3', '1565299624946-b28f40a0ae38', 
                        '1565958011703-44f9829ba187', '1504674900247-0877df9cc836',
                        '1476224203421-9ac3993c4c9d', '1493770348161-369560ae357d'
                    ],
                    market: [
                        '1533900298318-6b8da08a523e', '1488459739732-068fd246c3c5', 
                        '1506484334402-40f2cd067a82', '1597843796323-835682855169',
                        '1526367790999-015070c13b71', '1467307983825-619715426c70'
                    ],
                    place: [
                        '1502602898657-3e91760cbb34', '1518391846015-55a9cc003b25', 
                        '1513635269975-59663e0ac1ad', '1503917988258-f87a78e3c995', 
                        '1533105079780-92b9be482077', '1470770841072-f978cf4d019e',
                        '1469474968028-56623f02e42e', '1501785887741-f671910eba1e'
                    ],
                    hotel: [
                        '1566073771259-6a8506099945', // Luxury Hotel
                        '1582719478250-c89cae4dc85b', // Modern Hotel
                        '1561501900-3701fa1a0c1e', // Resort
                        '1542314831-068cd1dbfeeb', // Hotel Room
                        '1571896349842-33c89424de2d', // Pool Hotel
                        '1551882547-ff43cce67fe3', // Lobby
                        '1520250497591-112f2f40a3f4', // Boutique
                        '1445013541996-8146177bf397', // Relaxation
                        '1522771739844-6a9f6d5f14af', // Suite
                        '1549389742-531dfbfd3c36'  // City Hotel
                    ]
                };

                const category = item.absPath.includes('food') ? 'food' : 
                                 item.absPath.includes('market') ? 'market' : 
                                 item.absPath.includes('hotel') ? 'hotel' : 'place';
                
                const ids = categoryMaps[category] || categoryMaps.place;
                // Improved seed logic: combine item name and city to ensure uniqueness
                let hash = 0;
                const seedStr = `${item.city}-${item.name}`;
                for (let j = 0; j < seedStr.length; j++) {
                    hash = ((hash << 5) - hash) + seedStr.charCodeAt(j);
                    hash |= 0; // Convert to 32bit integer
                }
                const imageId = ids[Math.abs(hash) % ids.length];
                const downloadUrl = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=800&q=80`;

                console.log(`[${i+1}/${downloadQueue.length}] Downloading: ${item.name} (${item.city})`);
                execSync(`curl.exe -L -k -s -o "${item.absPath}" "${downloadUrl}"`);
            } catch (err) {
                console.error(`❌ Failed to download ${item.name}:`, err.message);
            }
        }

        // 2. Update JSON object in memory
        item.itemReference.image = item.relPath;
    }

    // 3. Save JSON
    console.log("💾 Saving updated itineraryData.json...");
    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));

    // 4. Update Database
    console.log("🗄️ Syncing database...");
    const [dbCities] = await sequelize.query("SELECT id, name FROM destinations");
    
    for (const cityEntry of dbCities) {
        const cityName = cityEntry.name;
        // Find matching data in our updated JSON
        const matchedKey = Object.keys(destinations).find(k => 
            k.toLowerCase() === cityName.toLowerCase() || 
            cityName.toLowerCase().includes(k.toLowerCase())
        );

        if (matchedKey) {
            const cityData = destinations[matchedKey];
            const cityId = cityEntry.id;

            const updateDB = async (items, cat) => {
                if (!items) return;
                for (const item of items) {
                    await sequelize.query(
                        "UPDATE places_cache SET image_url = ? WHERE destination_id = ? AND place_name = ?",
                        { replacements: [item.image, cityId, item.name] }
                    );
                }
            };

            await updateDB(cityData.places, 'place');
            await updateDB(cityData.food, 'food');
            await updateDB(cityData.markets, 'market');
        }
    }

    console.log("✨ Global Asset Population & Sync Complete!");
    await sequelize.close();
}

populateAssets();
