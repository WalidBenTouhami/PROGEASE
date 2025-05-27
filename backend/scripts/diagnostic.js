/**
 * Script de diagnostic pour identifier les problèmes de démarrage
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Fonction principale avec chaque étape séparée
async function runDiagnostic() {
    console.log('--- DÉBUT DU DIAGNOSTIC ---');

    try {
        // 1. Vérifier l'environnement
        console.log('[1] Vérification de l\'environnement...');
        dotenv.config();
        console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

        // 2. Vérifier les fichiers critiques
        console.log('\n[2] Vérification des fichiers critiques...');
        const criticalFiles = [
            '.env',
            'server.js',
            'config/constants.js',
            'src/graphql/schema.graphql',
            'src/graphql/standalone-server.js'
        ];

        criticalFiles.forEach(file => {
            const exists = fs.existsSync(path.resolve(__dirname, file));
            console.log(`${file}: ${exists ? '✅ Existe' : '❌ Manquant'}`);
        });

        // 3. Charger les configurations
        console.log('\n[3] Chargement des configurations...');
        try {
            console.log('Tentative de charger db.json...');
            const dbConfig = require('./db.json');
            console.log('db.json chargé avec succès');
        } catch (e) {
            console.error(`Erreur lors du chargement de db.json: ${e.message}`);
        }

        try {
            console.log('Tentative de charger config/constants.js...');
            const constants = require('./config/constants');
            console.log(`config/constants.js contient: ${Object.keys(constants).join(', ')}`);
        } catch (e) {
            console.error(`Erreur lors du chargement de constants.js: ${e.message}`);
        }

        // 4. Vérifier l'API key
        console.log('\n[4] Vérification de la clé API Deepseek...');
        const apiKey = process.env.DEEPSEEK_API_KEY;
        console.log(`Clé API Deepseek: ${apiKey ? '✅ Définie' : '❌ Non définie'}`);

        // 5. Vérifier la configuration MongoDB
        console.log('\n[5] Vérification de la configuration MongoDB...');
        const mongoUri = process.env.MONGODB_URI;
        console.log(`URI MongoDB: ${mongoUri ? '✅ Définie' : '❌ Non définie'}`);
        if (mongoUri) {
            // Masquer la partie sensible de l'URI pour la sécurité
            const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
            console.log(`URI (masquée): ${maskedUri}`);
        }

        console.log('\n--- FIN DU DIAGNOSTIC ---');
    } catch (error) {
        console.error('\n❌ ERREUR DE DIAGNOSTIC:', error);
    }
}

// Exécution
runDiagnostic().catch(err => {
    console.error('Erreur fatale lors du diagnostic:', err);
});