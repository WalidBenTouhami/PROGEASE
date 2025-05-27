/**
 * Module de cache pour les requêtes fréquentes
 * Utilise la mémoire par défaut mais peut être connecté à Redis
 */

const NodeCache = require('node-cache');
const logger = require('./logger');

// Cache en mémoire par défaut
const memoryCache = new NodeCache({
    stdTTL: 600,  // 10 minutes par défaut
    checkperiod: 120,  // Vérification toutes les 2 minutes
    useClones: false
});

// Interface commune pour différents types de cache
class Cache {
    constructor() {
        this.provider = memoryCache;
        this.isConnected = true;
        logger.info('Cache mémoire initialisé');
    }

    /**
     * Récupérer une valeur du cache
     * @param {string} key - Clé d'accès
     * @returns {Promise<Object|null>} Valeur ou null si non trouvée
     */
    async get(key) {
        try {
            return this.provider.get(key) || null;
        } catch (error) {
            logger.error(`Erreur de cache (get) pour la clé ${key}:`, error);
            return null;
        }
    }

    /**
     * Mettre en cache une valeur
     * @param {string} key - Clé d'accès
     * @param {Object} value - Valeur à mettre en cache
     * @param {number} ttl - Durée de vie en secondes
     * @returns {Promise<boolean>} Succès de l'opération
     */
    async set(key, value, ttl = 600) {
        try {
            return this.provider.set(key, value, ttl);
        } catch (error) {
            logger.error(`Erreur de cache (set) pour la clé ${key}:`, error);
            return false;
        }
    }

    /**
     * Supprimer une valeur du cache
     * @param {string} key - Clé d'accès
     * @returns {Promise<boolean>} Succès de l'opération
     */
    async del(key) {
        try {
            return this.provider.del(key) > 0;
        } catch (error) {
            logger.error(`Erreur de cache (del) pour la clé ${key}:`, error);
            return false;
        }
    }

    /**
     * Supprimer les entrées par préfixe
     * @param {string} prefix - Préfixe de clé
     * @returns {Promise<number>} Nombre d'entrées supprimées
     */
    async delByPrefix(prefix) {
        try {
            const keys = this.provider.keys();
            const matchingKeys = keys.filter(key => key.startsWith(prefix));

            if (matchingKeys.length > 0) {
                return this.provider.del(matchingKeys);
            }
            return 0;
        } catch (error) {
            logger.error(`Erreur de cache (delByPrefix) pour le préfixe ${prefix}:`, error);
            return 0;
        }
    }

    /**
     * Vider complètement le cache
     * @returns {Promise<boolean>} Succès de l'opération
     */
    async flush() {
        try {
            return this.provider.flushAll();
        } catch (error) {
            logger.error('Erreur lors du vidage du cache:', error);
            return false;
        }
    }

    /**
     * Obtenir les statistiques du cache
     * @returns {Object} Statistiques du cache
     */
    getStats() {
        return {
            hits: this.provider.getStats().hits,
            misses: this.provider.getStats().misses,
            keys: this.provider.keys().length
        };
    }
}

module.exports = new Cache();