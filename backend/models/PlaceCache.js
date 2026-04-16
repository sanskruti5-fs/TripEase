const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlaceCache = sequelize.define('PlaceCache', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    place_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 4.0
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    best_time_to_visit: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estimated_budget: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    suitability: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'places_cache',
    timestamps: false
});

module.exports = PlaceCache;
