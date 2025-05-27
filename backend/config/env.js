/**
 * Configuration des variables d'environnement
 * Charge les variables depuis ".env" et "db.json"
 *
 * @module config/env
 */

'use strict';

// Chargement des variables depuis le fichier .env
require('dotenv').config();

const fs = require('fs');
const path = require('path');

/**
 * Charge les variables d'environnement depuis db.json si disponible
 * Ces variables ont priorité inférieure par rapport à celles de ".env"
 */
function loadDBConfig() {
    const dbConfigPath = path.resolve(__dirname, '../db.json'); // Chemin corrigé

    try {
        if (fs.existsSync(dbConfigPath)) {
            const fileContent = fs.readFileSync(dbConfigPath, 'utf-8');
            const config = JSON.parse(fileContent);

            if (config && config.env) {
                // Fusionner les variables d'environnement (priorité à celles déjà définies dans ".env")
                Object.entries(config.env).forEach(([key, value]) => {
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                });
                console.log('Configuration supplémentaire chargée depuis db.json');
            }
        }
    } catch (error) {
        console.error(`Erreur lors du chargement de la configuration depuis db.json: ${error.message}`);
    }
}

/**
 * Définit les valeurs par défaut pour les variables non définies dans ".env" ou db.json
 */
function setDefaultValues() {
    // Valeurs par défaut si non définies dans ".env"
    const defaults = {
        PORT: '5000',
        NODE_ENV: 'development',
        LOG_LEVEL: 'info',
        FRONTEND_URL: 'http://localhost:3000',
        APOLLO_ENDPOINT: 'http://localhost:5000/graphql',
        APOLLO_SCHEMA_PATH: './src/graphql/schema.graphql',
        APOLLO_SCHEMA_OUTPUT_DIR: './schema-output'
    };

    Object.entries(defaults).forEach(([key, value]) => {
        process.env[key] = process.env[key] || value;
    });
}

/**
 * Initialise l'environnement
 */
function initEnv() {
    // D'abord charger ".env" (déjà fait au début du fichier)
    // Ensuite compléter avec db.json si nécessaire
    loadDBConfig();
    // Enfin, définir les valeurs par défaut pour les variables manquantes
    setDefaultValues();

    // Log des informations de base
    console.log(`[ENV] Environnement: ${process.env.NODE_ENV}`);
    console.log(`[ENV] Port: ${process.env.PORT}`);
    console.log(`[ENV] URL Frontend: ${process.env.FRONTEND_URL}`);
}

// Initialiser l'environnement
initEnv();

// Définition des fonctions utilitaires
const isDev = () => process.env.NODE_ENV === 'development';
const isTest = () => process.env.NODE_ENV === 'test';
const isProd = () => process.env.NODE_ENV === 'production';

// Exporter les variables d'environnement pour utilisation dans l'application
module.exports = {
    // Configuration serveur
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL,

    // Base de données
    MONGODB_URI: process.env.MONGODB_URI, // Ajout de MONGODB_URI qui manquait
    MONGO_URI: process.env.MONGO_URI,

    // Sécurité
    JWT_SECRET: process.env.JWT_SECRET,

    // API externes
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,

    // Apollo GraphQL
    APOLLO_KEY: process.env.APOLLO_KEY,
    APOLLO_GRAPH_REF: process.env.APOLLO_GRAPH_REF,
    APOLLO_SUBGRAPH_NAME: process.env.APOLLO_SUBGRAPH_NAME,
    APOLLO_ROUTING_URL: process.env.APOLLO_ROUTING_URL,
    APOLLO_ENDPOINT: process.env.APOLLO_ENDPOINT,
    APOLLO_SCHEMA_PATH: process.env.APOLLO_SCHEMA_PATH,
    APOLLO_SCHEMA_OUTPUT_DIR: process.env.APOLLO_SCHEMA_OUTPUT_DIR,

    // GraphQL
    GRAPHQL_KEY_PERSONAL: process.env.GRAPHQL_KEY_PERSONAL,

    // Utilitaires
    isDev,
    isTest,
    isProd
};