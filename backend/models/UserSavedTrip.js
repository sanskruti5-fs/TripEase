const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSavedTrip = sequelize.define('UserSavedTrip', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    trip_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    saved_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users_saved_trips',
    timestamps: false
});

module.exports = UserSavedTrip;
