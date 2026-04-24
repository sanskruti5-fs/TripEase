const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/mongoose');

const app = express();
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'https://trip-ease-sage.vercel.app'
        ];
        // Allow any .vercel.app subdomain or local host
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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

//uptime robot works
app.get("/api/test", (req, res) => {
    res.send("Server is alive");
});

// Simple Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'TripEase Backend' }));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
