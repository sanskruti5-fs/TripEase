const Destination = require('./models/Destination');
const PlaceCache = require('./models/PlaceCache');
const { Op } = require('sequelize');

async function cleanUp() {
  console.log('🧹 Cleaning up old database entries...');
  try {
    const cities = ['London', 'Paris', 'Bangalore', 'Banglore', 'london', 'paris', 'banglore'];
    for (const city of cities) {
      const dests = await Destination.findAll({ where: { name: { [Op.like]: `%${city}%` } } });
      for (const dest of dests) {
        await PlaceCache.destroy({ where: { destination_id: dest.id } });
        await dest.destroy();
        console.log(`✅ Cleared: ${dest.name}`);
      }
    }
    console.log('✨ All clear! Now searching will fetch improved data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
  }
}

cleanUp();
