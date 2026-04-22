const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI || mongoURI.includes('<username>')) {
            console.warn('⚠️ MONGO_URI is not set or still contains placeholders. Skipping DB connection for now.');
            return;
        }

        await mongoose.connect(mongoURI);

        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        // Don't exit process in dev, let the user fix the URI
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
