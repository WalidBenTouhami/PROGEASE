// src/config/performance.js

const winston = require('winston');
require('dotenv').config();

// Configuration du logger
const logger = winston.createLogger({
    level: 'info', // Niveau minimal de log
    format: winston.format.combine(
        winston.format.timestamp(), // Ajoute un timestamp
        winston.format.json()       // Format JSON pour les logs
    ),
    defaultMeta: { service: 'progease-backend' }, // Métadonnées par défaut
    transports: [
        // Logs dans la console (en développement)
        new winston.transports.Console({ level: process.env.NODE_ENV === 'development' ? 'debug' : 'info' }),

        // Logs dans un fichier (en production)
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'logs/all.log',
            level: 'info'
        })
    ]
});

// Middleware Morgan pour les requêtes HTTP (optionnel)
if (process.env.NODE_ENV !== 'test') {
    const morgan = require('morgan');
    const express = require('express');

    module.exports.setupHttpLogging = (app) => {
        app.use(morgan('combined', {
            stream: {
                write: (message) => logger.info(message.trim())
            }
        }));
    };
}

module.exports = logger;