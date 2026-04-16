const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false // Disable logging for cleaner console
});

// Test the connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ SQLite Database Connected');
    } catch (error) {
        console.error('❌ SQLite Connection Error:', error);
    }
};

testConnection();

module.exports = sequelize;
