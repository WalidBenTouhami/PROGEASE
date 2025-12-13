/**
 * Gestion de la configuration d'environnement
 * @module config/env
 * @requires dotenv
 * @author WalidBenTouhami
 * @version 2.0.0
 * @updated 2025-05-27
 */

'use strict';

const path = require('path');
const dotenv = require('dotenv');
const { ENV } = require('./constants');
const fs = require('fs');

/**
 * Charge les variables d'environnement depuis le fichier .env approprie
 * @function loadEnv
 */
const loadEnv = () => {
    // Determiner l'environnement actuel
    const nodeEnv = process.env.NODE_ENV || 'development';

    // Fichiers de configuration à charger en ordre de priorite croissante
    const envFiles = [
        '.env', // Fichier de base
        `.env.${nodeEnv}`, // Specifique à l'environnement
        `.env.${nodeEnv}.local`, // Specifique à l'environnement et la machine
        '.env.local', // Surcharges locales
    ];

    // Charger les fichiers s'ils existent
    envFiles.forEach(file => {
        const envPath = path.resolve(process.cwd(), file);
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
        }
    });

    // Verifier les variables d'environnement requises
    validateEnv();
};

/**
 * Verifie que les variables d'environnement requises sont presentes
 * @function validateEnv
 * @throws {Error} Si une variable d'environnement requise est manquante
 */
const validateEnv = () => {
    const requiredVars = ['MONGODB_URI', 'PORT', 'NODE_ENV'];

    // Variables requises seulement en production
    if (process.env.NODE_ENV === ENV.PROD) {
        requiredVars.push('JWT_SECRET', 'API_RATE_LIMIT');
    }

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    }
};

/**
 * Renvoie toutes les variables d'environnement filtrees pour etre securitaire
 * à afficher dans les diagnostics (sans secrets)
 * @function getSafeEnv
 * @returns {Object} Variables d'environnement filtrees
 */
const getSafeEnv = () => {
    // Liste des variables à ne pas exposer
    const sensitiveVars = [
        'JWT_SECRET',
        'MONGODB_URI',
        'GITHUB_TOKEN',
        'API_KEY',
        'PASSWORD',
        'SECRET',
        'TOKEN',
    ];

    // Filtrer les variables sensibles
    return Object.entries(process.env).reduce((safeEnv, [key, value]) => {
        // Verifier si la cle contient un mot sensible
        if (sensitiveVars.some(sensitive => key.includes(sensitive))) {
            safeEnv[key] = '******';
        } else {
            safeEnv[key] = value;
        }
        return safeEnv;
    }, {});
};

module.exports = {
    loadEnv,
    getSafeEnv,
};
