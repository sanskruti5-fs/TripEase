const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function researchHotels() {
  try {
    const [results] = await sequelize.query(`
      SELECT d.name as city, pc.place_name, pc.image_url 
      FROM places_cache pc
      JOIN destinations d ON pc.destination_id = d.id
      WHERE pc.category = 'hotel'
      ORDER BY d.name
    `);
    
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

researchHotels();
