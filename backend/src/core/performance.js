// src/core/performance.js

const winston = require('winston');
require('dotenv').config();

// Logger spécifique aux performances
const performanceLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/performance.log', level: 'info' }),
        new winston.transports.Console({ level: process.env.NODE_ENV === 'development' ? 'debug' : 'info' })
    ]
});

// 📊 Capturer les métriques de performance MongoDB
let msg;
msg.attr.deprecatedName = undefined;
exports.capturePerformanceMetrics = (logMessages) => {
    logMessages.forEach((msg) => {
        if (msg.c === 'WTRECOV' || msg.c === 'STORAGE') {
            // Logs liés à WiredTiger et recovery
            performanceLogger.info(`WiredTiger Recovery: ${msg.msg}`, { metadata: msg.attr });
        }

        if (msg.c === 'FTDC') {
            // Logs liés à Full-Time Data Capture
            if (msg.id === 23718 && msg.s === 'W') {
                performanceLogger.warn(`Échec de l'initialisation des compteurs FTDC : ${msg.attr.error.errmsg}`);
            } else if (msg.id === 20625 && msg.s === 'I') {
                performanceLogger.info('Initialisation des données de diagnostic FTDC réussie', { directory: msg.attr.dataDirectory });
            }
        }

        if (msg.id === 636300 && msg.s === 'W') {
            // Logs liés aux paramètres dépréciés
            performanceLogger.warn(`Paramètre déprécié utilisé : ${msg.attr.deprecatedName}. Remplacez-le par ${msg.attr.canonicalName}.`);
        }

        if (msg.id === 22140 && msg.s === 'W') {
            // Logs liés au bind localhost
            performanceLogger.warn('Serveur MongoDB bindé à localhost. Pour autoriser les connexions distantes, utilisez --bind_ip_all.');
        }

        if (msg.id === 22120 && msg.s === 'W') {
            // Logs liés à l'authentification désactivée
            performanceLogger.warn('Authentification MongoDB non activée. Pour activer, utilisez --auth ou configurez un utilisateur.');
        }
    });
};

// Export du logger
module.exports = performanceLogger;