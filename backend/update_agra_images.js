const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function updateAgra() {
  try {
    const [dest] = await sequelize.query("SELECT id FROM destinations WHERE name LIKE '%Agra%' LIMIT 1");
    if (!dest || dest.length === 0) throw new Error("Agra not found");
    const agraId = dest[0].id;

    const updates = [
      { name: 'Petha', url: '/images/agra/petha.jpg' },
      { name: 'Bedai & Jalebi', url: '/images/agra/bedai-jalebi.jpg' },
      { name: 'Mughlai Curry', url: '/images/agra/mughlai-curry.jpg' },
      { name: 'Dalmoth', url: '/images/agra/dalmoth.jpg' },
      { name: 'Sadar Bazaar', url: '/images/agra/sadar-bazaar.jpg' },
      { name: 'Kinari Bazaar', url: '/images/agra/kinari-bazaar.jpg' }
    ];

    for (const item of updates) {
      await sequelize.query(
        "UPDATE places_cache SET image_url = ? WHERE destination_id = ? AND place_name = ?",
        { replacements: [item.url, agraId, item.name] }
      );
    }
    console.log("✅ Agra database images updated to local paths.");
  } catch (err) {
    console.error("❌ DB Update failed:", err.message);
  } finally {
    await sequelize.close();
  }
}

updateAgra();
