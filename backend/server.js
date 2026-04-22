const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/mongoose');

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'https://trip-ease-sage.vercel.app'],
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const aiRoutes = require('./routes/aiRoutes');

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);

// Simple Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'TripEase Backend' }));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
