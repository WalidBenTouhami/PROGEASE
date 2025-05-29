// config/env.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const dbConfigPath = path.resolve(__dirname, 'db.json');

// ✅ Chargement des variables d'environnement depuis db.json
if (fs.existsSync(dbConfigPath)) {
    const envConfig = JSON.parse(fs.readFileSync(dbConfigPath, 'utf-8')).env;

    process.env.PORT = envConfig.PORT || process.env.PORT;
    process.env.MONGO_URI = envConfig.MONGO_URI || process.env.MONGO_URI;
    process.env.JWT_SECRET = envConfig.JWT_SECRET || process.env.JWT_SECRET;
}