/**
 * Plugin Apollo Server pour limiter le debit des requetes GraphQL
 *
 * @module plugins/rateLimiter
 */

'use strict';

const { AppError } = require('../middlewares/errorHandlers');
const logger = require('../utils/logger');

// Map pour suivre les requetes par IP
const requestMap = new Map();

/**
 * Nettoie les entrees expirees dans la map des requetes
 * @param {Map} map - La map à nettoyer
 * @param {number} windowMs - Fenetre de temps en millisecondes
 */
function cleanupExpiredEntries(map, windowMs) {
    const now = Date.now();
    for (const [ip, data] of map.entries()) {
        if (now - data.timestamp > windowMs) {
            map.delete(ip);
        }
    }
}

/**
 * Cree un plugin de limitation de debit pour Apollo Server
 * @param {Object} options - Options de configuration
 * @param {number} options.windowMs - Fenetre de temps en millisecondes (defaut: 15min)
 * @param {number} options.max - Nombre maximum de requetes par IP (defaut: 100)
 * @param {Function} options.keyGenerator - Fonction pour generer la cle (defaut: IP)
 * @param {Function} options.skip - Fonction pour ignorer certaines requetes
 * @returns {Object} Plugin Apollo Server
 */
function GraphQLRateLimiterPlugin(options = {}) {
    const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes par defaut
    const max = options.max || 100; // 100 requetes par defaut
    const keyGenerator =
        options.keyGenerator ||
        (requestContext =>
            requestContext.request.http.headers.get('x-forwarded-for') ||
            requestContext.contextValue?.ip ||
            'anonymous');
    const skip = options.skip || (() => false);

    // Nettoyage periodique des entrees expirees (toutes les minutes)
    setInterval(() => cleanupExpiredEntries(requestMap, windowMs), 60 * 1000);

    return {
        // Utiliser requestDidStart pour intercepter chaque requete
        async requestDidStart(requestContext) {
            // Ignorer certaines requetes si necessaire
            if (skip(requestContext)) {
                return {};
            }

            const key = keyGenerator(requestContext);
            const now = Date.now();

            // Recuperer ou initialiser les donnees pour cette IP
            const current = requestMap.get(key) || {
                count: 0,
                timestamp: now,
                firstRequest: now,
            };

            // Reinitialiser le compteur si la fenetre de temps est depassee
            if (now - current.firstRequest > windowMs) {
                current.count = 0;
                current.firstRequest = now;
            }

            // Incrementer le compteur
            current.count += 1;
            current.timestamp = now;

            // Mettre à jour la map
            requestMap.set(key, current);

            // Verifier si la limite est depassee
            if (current.count > max) {
                logger.warn(`Limite de debit depassee pour ${key}: ${current.count} requetes`);

                // Retourner une erreur formatee
                throw new AppError(
                    'Trop de requetes, veuillez reessayer apres un moment',
                    429,
                    'ERR_RATE_LIMIT'
                );
            }

            // Permettre à la requete de continuer normalement
            return {};
        },
    };
}

module.exports = { GraphQLRateLimiterPlugin };
