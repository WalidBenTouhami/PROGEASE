// config/db.js

const mongoose = require('mongoose');

// ✅ Connexion à MongoDB
async function connectToDatabase(mongoUri) {
    try {
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1); // Terminate process if connection fails
    }
}

module.exports = connectToDatabase;