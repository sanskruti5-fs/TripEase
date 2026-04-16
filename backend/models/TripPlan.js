const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TripPlan = sequelize.define('TripPlan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    destination: {
        type: DataTypes.STRING,
        allowNull: false
    },
    budget: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    trip_type: {
        type: DataTypes.ENUM('family', 'solo', 'luxury', 'adventure', 'couple', 'friends', 'relaxation'),
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    generated_plan: {
        type: DataTypes.JSON, // Stores the full itinerary object
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'trip_plans',
    timestamps: false
});

module.exports = TripPlan;
