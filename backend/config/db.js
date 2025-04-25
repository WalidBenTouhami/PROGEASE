// config/db.js

const fs = require('fs');
const path = require('path');

const dbConfigPath = path.resolve(__dirname, 'db.json');
const dbConfig = JSON.parse(fs.readFileSync(dbConfigPath, 'utf-8'));

console.log('Database Config:', dbConfig);