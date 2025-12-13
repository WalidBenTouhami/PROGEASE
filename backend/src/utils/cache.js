/**
 * Module de cache pour les requetes frequentes
 * Utilise la memoire par defaut mais peut etre connecte à Redis
 */

const NodeCache = require('node-cache');
const logger = require('./logger');

// Cache en memoire par defaut
const memoryCache = new NodeCache({
    stdTTL: 600, // 10 minutes par defaut
    checkperiod: 120, // Verification toutes les 2 minutes
    useClones: false,
});

// Interface commune pour differents types de cache
class Cache {
    constructor() {
        this.provider = memoryCache;
        this.isConnected = true;
        logger.info('Cache memoire initialise');
    }

    /**
     * Recuperer une valeur du cache
     * @param {string} key - Cle d'acces
     * @returns {Promise<Object|null>} Valeur ou null si non trouvee
     */
    async get(key) {
        try {
            return this.provider.get(key) || null;
        } catch (error) {
            logger.error(`Erreur de cache (get) pour la cle ${key}:`, error);
            return null;
        }
    }

    /**
     * Mettre en cache une valeur
     * @param {string} key - Cle d'acces
     * @param {Object} value - Valeur à mettre en cache
     * @param {number} ttl - Duree de vie en secondes
     * @returns {Promise<boolean>} Succes de l'operation
     */
    async set(key, value, ttl = 600) {
        try {
            return this.provider.set(key, value, ttl);
        } catch (error) {
            logger.error(`Erreur de cache (set) pour la cle ${key}:`, error);
            return false;
        }
    }

    /**
     * Supprimer une valeur du cache
     * @param {string} key - Cle d'acces
     * @returns {Promise<boolean>} Succes de l'operation
     */
    async del(key) {
        try {
            return this.provider.del(key) > 0;
        } catch (error) {
            logger.error(`Erreur de cache (del) pour la cle ${key}:`, error);
            return false;
        }
    }

    /**
     * Supprimer les entrees par prefixe
     * @param {string} prefix - Prefixe de cle
     * @returns {Promise<number>} Nombre d'entrees supprimees
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
            logger.error(`Erreur de cache (delByPrefix) pour le prefixe ${prefix}:`, error);
            return 0;
        }
    }

    /**
     * Vider completement le cache
     * @returns {Promise<boolean>} Succes de l'operation
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
            keys: this.provider.keys().length,
        };
    }
}

module.exports = new Cache();
