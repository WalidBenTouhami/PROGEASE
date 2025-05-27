/**
 * Plugin Apollo Server pour limiter le débit des requêtes GraphQL
 *
 * @module plugins/rateLimiter
 */

'use strict';

const { AppError } = require('../middleware/errorHandlers');
const logger = require('../utils/logger');

// Map pour suivre les requêtes par IP
const requestMap = new Map();

/**
 * Nettoie les entrées expirées dans la map des requêtes
 * @param {Map} map - La map à nettoyer
 * @param {number} windowMs - Fenêtre de temps en millisecondes
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
 * Crée un plugin de limitation de débit pour Apollo Server
 * @param {Object} options - Options de configuration
 * @param {number} options.windowMs - Fenêtre de temps en millisecondes (défaut: 15min)
 * @param {number} options.max - Nombre maximum de requêtes par IP (défaut: 100)
 * @param {Function} options.keyGenerator - Fonction pour générer la clé (défaut: IP)
 * @param {Function} options.skip - Fonction pour ignorer certaines requêtes
 * @returns {Object} Plugin Apollo Server
 */
function GraphQLRateLimiterPlugin(options = {}) {
    const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes par défaut
    const max = options.max || 100; // 100 requêtes par défaut
    const keyGenerator = options.keyGenerator ||
        (requestContext => requestContext.request.http.headers.get('x-forwarded-for') ||
            requestContext.contextValue?.ip ||
            'anonymous');
    const skip = options.skip || (() => false);

    // Nettoyage périodique des entrées expirées (toutes les minutes)
    setInterval(() => cleanupExpiredEntries(requestMap, windowMs), 60 * 1000);

    return {
        // Utiliser requestDidStart pour intercepter chaque requête
        async requestDidStart(requestContext) {
            // Ignorer certaines requêtes si nécessaire
            if (skip(requestContext)) {
                return {};
            }

            const key = keyGenerator(requestContext);
            const now = Date.now();

            // Récupérer ou initialiser les données pour cette IP
            const current = requestMap.get(key) || {
                count: 0,
                timestamp: now,
                firstRequest: now
            };

            // Réinitialiser le compteur si la fenêtre de temps est dépassée
            if (now - current.firstRequest > windowMs) {
                current.count = 0;
                current.firstRequest = now;
            }

            // Incrémenter le compteur
            current.count += 1;
            current.timestamp = now;

            // Mettre à jour la map
            requestMap.set(key, current);

            // Vérifier si la limite est dépassée
            if (current.count > max) {
                logger.warn(`Limite de débit dépassée pour ${key}: ${current.count} requêtes`);

                // Retourner une erreur formatée
                throw new AppError(
                    `Trop de requêtes, veuillez réessayer après un moment`,
                    429,
                    'ERR_RATE_LIMIT'
                );
            }

            // Permettre à la requête de continuer normalement
            return {};
        }
    };
}

module.exports = { GraphQLRateLimiterPlugin };