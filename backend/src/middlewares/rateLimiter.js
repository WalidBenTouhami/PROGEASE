const rateLimit = require('express-rate-limit');

/**
 * Crée un middleware de limitation de taux de requêtes
 * @param {Object} options - Options de configuration
 * @param {number} options.windowMs - Fenêtre de temps en millisecondes
 * @param {number} options.max - Nombre maximum de requêtes par fenêtre
 * @returns {Function} Middleware Express
 */
const rateLimiter = ({ windowMs = 15 * 60 * 1000, max = 100 } = {}) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message: 'Trop de requêtes, veuillez réessayer plus tard.',
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

module.exports = {
    rateLimiter,
};
