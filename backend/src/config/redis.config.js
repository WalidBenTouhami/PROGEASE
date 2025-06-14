const Redis = require('ioredis');
const config = require('./index');
const logger = require('../utils/logger');

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redisClient.on('connect', () => {
  logger.info('✅ Redis connection established');
});

redisClient.on('error', (err) => {
  logger.error('❌ Redis connection error:', err);
});

redisClient.on('ready', () => {
  logger.info('✅ Redis client ready');
});

redisClient.on('reconnecting', () => {
  logger.info('🔄 Redis client reconnecting...');
});

// Cache middleware
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);
      
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      res.originalJson = res.json;
      res.json = (body) => {
        redisClient.setex(key, duration, JSON.stringify(body));
        return res.originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    try {
      const keys = await redisClient.keys(patterns);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Cache invalidated for patterns: ${patterns}`);
      }
      next();
    } catch (error) {
      logger.error('Cache invalidation error:', error);
      next();
    }
  };
};

module.exports = {
  redisClient,
  cacheMiddleware,
  invalidateCache
}; 