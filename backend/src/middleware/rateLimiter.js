/**
 * Middleware de limitation de taux de requetes
 * Protection contre les abus et attaques par force brute
 */
const rateLimit = require('express-rate-limit');
const { ConfigSecurite } = require('../../config/constants');
const logger = require('../utils/logger');

/**
 * Crée un middleware de limitation de taux avec des paramètres personnalisés
 * @param {Object} options - Options de configuration
 * @param {number} options.windowMs - Fenêtre de temps en millisecondes
 * @param {number} options.max - Nombre maximum de requêtes par fenêtre
 */
const rateLimiter = ({ windowMs = 15 * 60 * 1000, max = 100 } = {}) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message: 'Trop de requêtes, veuillez réessayer plus tard.',
            error: 'Rate limit exceeded'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

// Middleware global pour toutes les routes
const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: {
        status: 'error',
        message: 'Trop de requêtes, veuillez réessayer plus tard.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    rateLimiter,
    globalRateLimiter
};