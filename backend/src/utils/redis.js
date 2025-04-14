// src/utils/redis.js

import { createClient } from 'redis';
import { createLogger } from './logger.js';

const logger = createLogger('RedisClient');

const redisClient = createClient({
    url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => {
    logger.error('Erreur Redis :', { message: err.message, stack: err.stack });
});

redisClient.on('connect', () => {
    logger.info('Connexion à Redis réussie.');
});

redisClient.on('ready', () => {
    logger.info('Redis est prêt à être utilisé.');
});

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        logger.info('Client Redis connecté avec succès.');
    } catch (err) {
        logger.error('Échec de la connexion à Redis :', { message: err.message, stack: err.stack });
        throw err;
    }
};

export { redisClient };