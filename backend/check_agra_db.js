const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function checkAgra() {
  try {
    const [results] = await sequelize.query(`
      SELECT pc.id, pc.place_name, pc.category, pc.image_url 
      FROM places_cache pc
      JOIN destinations d ON pc.destination_id = d.id
      WHERE d.name LIKE '%Agra%' AND pc.category IN ('food', 'market')
    `);
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

checkAgra();
