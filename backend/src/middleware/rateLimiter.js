/**
 * Middleware de limitation de taux de requetes
 * Protection contre les abus et attaques par force brute
 */
const rateLimit = require('express-rate-limit');
const { ConfigSecurite } = require('../../config/constants');
const logger = require('../utils/logger');

/**
 * Creer un middleware de limitation de debit avec des options personnalisees
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
            message: 'Trop de requetes. Veuillez reessayer plus tard.'
        },
        handler: (req, res, next, options) => {
            logger.security(`Rate limit depasse: ${req.ip} - ${req.originalUrl}`, {
                ip: req.ip,
                url: req.originalUrl
            });
            res.status(429).send(options.message);
        },
        // Cle personnalisee combinant IP et chemin
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