// src/core/performance.js

import { performance } from 'perf_hooks';
import { logger } from '../utils/logger.js';

const metrics = {
    requestCount: 0,
    totalResponseTime: 0,
    dbQueryCount: 0
};

export const trackRequest = (req, res, next) => {
    const start = performance.now();

    res.on('finish', () => {
        const duration = performance.now() - start;
        metrics.requestCount++;
        metrics.totalResponseTime += duration;

        logger.info(`${req.method} ${req.url} - ${res.statusCode} (${duration.toFixed(2)}ms)`);
    });

    next();
};

export const trackDBQuery = (query) => {
    metrics.dbQueryCount++;
    const start = performance.now();

    query.exec((err, result) => {
        const duration = performance.now() - start;
        logger.debug(`DB Query [${query.op}] - ${duration.toFixed(2)}ms`);
    });

    return query;
};

export const getMetrics = () => ({
    ...metrics,
    avgResponseTime: metrics.totalResponseTime / metrics.requestCount
});