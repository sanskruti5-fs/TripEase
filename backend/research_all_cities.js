const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function researchCities() {
  try {
    const [results] = await sequelize.query(`
      SELECT d.name as city, pc.place_name, pc.category, pc.image_url 
      FROM places_cache pc
      JOIN destinations d ON pc.destination_id = d.id
      WHERE pc.category IN ('food', 'market')
      ORDER BY d.name, pc.category
    `);
    
    // Group by city
    const grouped = results.reduce((acc, curr) => {
      if (!acc[curr.city]) acc[curr.city] = { food: [], market: [] };
      if (curr.category === 'food') acc[curr.city].food.push(curr.place_name + ": " + curr.image_url);
      else acc[curr.city].market.push(curr.place_name + ": " + curr.image_url);
      return acc;
    }, {});

    console.log(JSON.stringify(grouped, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

researchCities();
