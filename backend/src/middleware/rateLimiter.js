/**
 * Middleware de limitation de taux de requêtes
 * Protection contre les abus et attaques par force brute
 */
const rateLimit = require('express-rate-limit');
const { ConfigSecurite } = require('../../config/constants');
const logger = require('../utils/logger');

/**
 * Créer un middleware de limitation de débit avec des options personnalisées
 * @param {Object} options - Options de limitation
 * @returns {Function} Middleware Express
 */
const rateLimiter = (options = {}) => {
    const defaultOptions = {
        windowMs: ConfigSecurite.RATE_LIMIT.WINDOW_MS,
        max: ConfigSecurite.RATE_LIMIT.MAX_REQUESTS,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            status: 'error',
            code: 'TOO_MANY_REQUESTS',
            message: 'Trop de requêtes. Veuillez réessayer plus tard.'
        },
        handler: (req, res, next, options) => {
            logger.security(`Rate limit dépassé: ${req.ip} - ${req.originalUrl}`, {
                ip: req.ip,
                url: req.originalUrl
            });
            res.status(429).send(options.message);
        },
        // Clé personnalisée combinant IP et chemin
        keyGenerator: (req) => `${req.ip}:${req.originalUrl}`
    };

    return rateLimit({
        ...defaultOptions,
        ...options
    });
};

// Middleware global pour toutes les routes
const globalRateLimiter = rateLimiter();

module.exports = rateLimiter;
module.exports.globalRateLimiter = globalRateLimiter;