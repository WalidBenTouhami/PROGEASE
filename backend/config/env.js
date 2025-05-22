// config/env.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const cheminConfigDB = path.resolve(__dirname, 'db.json');

// Chargement des variables d'environnement depuis db.json
if (fs.existsSync(cheminConfigDB)) {
    const configEnv = JSON.parse(fs.readFileSync(cheminConfigDB, 'utf-8')).env;
    process.env.PORT = configEnv.PORT || process.env.PORT;
    process.env.MONGO_URI = configEnv.MONGO_URI || process.env.MONGO_URI;
    process.env.JWT_SECRET = configEnv.JWT_SECRET || process.env.JWT_SECRET;
}