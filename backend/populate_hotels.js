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

const HOTEL_IMAGE_POOL = [
    '1566073771259-6a8506099945', '1582719478250-c89cae4dc85b', 
    '1561501900-3701fa1a0c1e', '1542314831-068cd1dbfeeb', 
    '1571896349842-33c89424de2d', '1551882547-ff43cce67fe3', 
    '1520250497591-112f2f40a3f4', '1445013541996-8146177bf397', 
    '1522771739844-6a9f6d5f14af', '1549389742-531dfbfd3c36', 
    '1590073846660-86f5e5513d2a', '1596394516093-501ba68a0ba6', 
    '1596178065867-0c3c7caad09e', '1606046139167-1249b5c3ee6b', 
    '1512918766752-df7a960437f4', '1517840901100-8179e982ad41', 
    '1535827848718-a483a9a1d4a9', '1505691938895-1758d7eaa511', 
    '1560185007-c5ca9a2c9409', '1578683011757-d352af5f56b0'
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
    console.log("🏨 Specialized Hotel Asset Population & Diversification starting...");

    // 1. Process Database Hotels (Master Source)
    console.log("🗄️ Auditing Database Cache...");
    const [dbHotels] = await sequelize.query(`
        SELECT pc.id, pc.place_name, pc.image_url, d.name as city_name 
        FROM places_cache pc
        JOIN destinations d ON pc.destination_id = d.id
        WHERE pc.category = 'hotel'
    `);

    console.log(`📦 Found ${dbHotels.length} hotels in database cache.`);

    for (let i = 0; i < dbHotels.length; i++) {
        const hotel = dbHotels[i];
        const citySlug = hotel.city_name.toLowerCase().replace(/\s+/g, '-');
        const hotelSlug = hotel.place_name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
        const filename = `hotel-${hotelSlug}.jpg`;
        const cityDir = path.join(IMAGES_ROOT, citySlug);
        const absPath = path.join(cityDir, filename);
        const relPath = `/images/${citySlug}/${filename}`;

        if (!fs.existsSync(cityDir)) fs.mkdirSync(cityDir, { recursive: true });

        // Force download if current image is not local or is a generic placeholder
        const needsLocal = !hotel.image_url || !hotel.image_url.startsWith('/images') || hotel.image_url.includes('loremflickr');

        if (needsLocal) {
            if (!fs.existsSync(absPath)) {
                const seedHash = getHash(`${hotel.city_name}-${hotel.place_name}`);
                const imageId = HOTEL_IMAGE_POOL[seedHash % HOTEL_IMAGE_POOL.length];
                const downloadUrl = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=800&q=80`;

                console.log(`[${i+1}/${dbHotels.length}] Localizing Hotel: ${hotel.place_name} (${hotel.city_name})`);
                try {
                    execSync(`curl.exe -L -k -s -o "${absPath}" "${downloadUrl}"`);
                } catch (err) {
                    console.error(`❌ Failed: ${hotel.place_name}`);
                }
            }

            // Update Database
            await sequelize.query(
                "UPDATE places_cache SET image_url = ? WHERE id = ?",
                { replacements: [relPath, hotel.id] }
            );
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
                    const relPath = `/images/${citySlug}/hotel-${hotelSlug}.jpg`;
                    
                    // We assume the file was either just downloaded or already existed
                    hotel.image = relPath;
                });
            }
        });
        fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
    }

    console.log("✨ Hotel Diversification & Sync Complete!");
    await sequelize.close();
}

populateHotels();
