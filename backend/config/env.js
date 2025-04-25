// config/env.js

const fs = require('fs');
const path = require('path');

const dbConfigPath = path.resolve(__dirname, 'db.json');
const envConfig = JSON.parse(fs.readFileSync(dbConfigPath, 'utf-8')).env;

process.env.PORT = envConfig.PORT;
process.env.MONGO_URI = envConfig.MONGO_URI;
process.env.JWT_SECRET = envConfig.JWT_SECRET;