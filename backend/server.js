const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripease';
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const aiRoutes = require('./routes/aiRoutes');
// Models (Required for sync)
const Destination = require('./models/Destination');
const PlaceCache = require('./models/PlaceCache');
const TripPlan = require('./models/TripPlan');
const UserSavedTrip = require('./models/UserSavedTrip');
// Sync SQLite Database
sequelize.sync({ alter: true }) // Set alter:true to add new tables
    .then(() => console.log('✅ SQLite Database & Models Synced'))
    .catch(err => console.error('❌ SQLite Sync Error:', err));

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);
// Simple Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'TripEase Backend' }));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
