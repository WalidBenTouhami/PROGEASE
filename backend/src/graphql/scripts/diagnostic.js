// scripts/diagnostic.js
const fs = require('fs');
const path = require('path');
const os = require('os');

// Charger les variables d'environnement
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '..', '.env');
console.log(`Chargement du fichier .env depuis: ${envPath}`);
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
    console.log(`❌ Erreur lors du chargement du fichier .env: ${envResult.error.message}`);
} else {
    console.log('✅ Fichier .env charge avec succes');
}

console.log('--- DeBUT DU DIAGNOSTIC ---');

// Fonction d'aide pour verifier l'existence d'un fichier
function checkFile(filePath, relativePath) {
    const fullPath = path.join(__dirname, '..', relativePath);
    const exists = fs.existsSync(fullPath);
    console.log(`${relativePath}: ${exists ? '✅ Present' : '❌ Manquant'}`);
    return exists;
}

// Verification de l'environnement
console.log('[1] Verification de l\'environnement...');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'non defini'}`);
console.log(`Systeme: ${os.type()} ${os.release()}`);
console.log(`Node.js: ${process.version}`);
console.log(`Memoire totale: ${Math.round(os.totalmem() / (1024 * 1024))} MB`);
console.log(`Memoire libre: ${Math.round(os.freemem() / (1024 * 1024))} MB`);
console.log('');

// Verification des fichiers critiques
console.log('[2] Verification des fichiers critiques...');
const criticalFiles = [
    '.env',
    'server.js',
    'config/constants.js',
    'src/models/projet.model.js',
    'src/models/livrable.model.js',
    'src/controllers/projet.controller.js',
    'src/controllers/livrable.controller.js'
];

criticalFiles.forEach(file => checkFile(file, file));
console.log('');

// Verification des configurations
console.log('[3] Verification des configurations...');
const envVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'DEEPSEEK_API_KEY'
];

envVars.forEach(envVar => {
    console.log(`${envVar}: ${process.env[envVar] ? '✅ Defini' : '❌ Non defini'}`);
});
console.log('');

// Verification de la connexion MongoDB
console.log('[4] Verification de la connexion MongoDB...');
const mongoUri = process.env.MONGODB_URI;
console.log(`URI MongoDB: ${mongoUri ? '✅ Definie' : '❌ Non definie'}`);

if (mongoUri) {
    try {
        const mongoose = require('mongoose');
        mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                console.log('✅ Connexion à MongoDB reussie');
                mongoose.connection.close();
            })
            .catch(err => {
                console.log(`❌ Erreur de connexion MongoDB: ${err.message}`);
            });
    } catch (error) {
        console.log('❌ echec du test de connexion MongoDB:', error.message);
    }
} else {
    console.log('❌ Impossible de tester la connexion MongoDB: URI non definie');
}
console.log('');

// Verification des packages installes
console.log('[5] Verification des packages critiques...');
const criticalPackages = [
    'express',
    'mongoose',
    'dotenv',
    '@apollo/server',
    'winston',
    'node-cache',
    'yup',
    'express-rate-limit',
    'helmet'
];

criticalPackages.forEach(packageName => {
    try {
        require(packageName);
        console.log(`${packageName}: ✅ Installe`);
    } catch (error) {
        console.log(`${packageName}: ❌ Non installe ou introuvable`);
    }
});

console.log('');
console.log('--- FIN DU DIAGNOSTIC ---');
