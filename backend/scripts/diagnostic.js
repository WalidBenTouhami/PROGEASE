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
    console.log('✅ Fichier .env chargé avec succès');
}

console.log('--- DÉBUT DU DIAGNOSTIC ---');

// Fonction d'aide pour vérifier l'existence d'un fichier
function checkFile(filePath, relativePath) {
    const fullPath = path.join(__dirname, '..', relativePath);
    const exists = fs.existsSync(fullPath);
    console.log(`${relativePath}: ${exists ? '✅ Présent' : '❌ Manquant'}`);
    return exists;
}

// Vérification de l'environnement
console.log('[1] Vérification de l\'environnement...');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'non défini'}`);
console.log(`Système: ${os.type()} ${os.release()}`);
console.log(`Node.js: ${process.version}`);
console.log(`Mémoire totale: ${Math.round(os.totalmem() / (1024 * 1024))} MB`);
console.log(`Mémoire libre: ${Math.round(os.freemem() / (1024 * 1024))} MB`);
console.log('');

// Vérification des fichiers critiques
console.log('[2] Vérification des fichiers critiques...');
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

// Vérification des configurations
console.log('[3] Vérification des configurations...');
const envVars = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'DEEPSEEK_API_KEY'
];

envVars.forEach(envVar => {
    console.log(`${envVar}: ${process.env[envVar] ? '✅ Défini' : '❌ Non défini'}`);
});
console.log('');

// Vérification de la connexion MongoDB
console.log('[4] Vérification de la connexion MongoDB...');
const mongoUri = process.env.MONGO_URI;
console.log(`URI MongoDB: ${mongoUri ? '✅ Définie' : '❌ Non définie'}`);

if (mongoUri) {
    try {
        const mongoose = require('mongoose');
        mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                console.log('✅ Connexion à MongoDB réussie');
                mongoose.connection.close();
            })
            .catch(err => {
                console.log(`❌ Erreur de connexion MongoDB: ${err.message}`);
            });
    } catch (error) {
        console.log('❌ Échec du test de connexion MongoDB:', error.message);
    }
} else {
    console.log('❌ Impossible de tester la connexion MongoDB: URI non définie');
}
console.log('');

// Vérification des packages installés
console.log('[5] Vérification des packages critiques...');
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
        console.log(`${packageName}: ✅ Installé`);
    } catch (error) {
        console.log(`${packageName}: ❌ Non installé ou introuvable`);
    }
});

console.log('');
console.log('--- FIN DU DIAGNOSTIC ---');
