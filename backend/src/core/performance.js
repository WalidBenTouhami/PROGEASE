// src/core/performance.js

import { performance } from 'perf_hooks';
import * as logger from '../utils/logger.js';

// 📌 Initialisation des métriques
const metrics = {
    requestCount: 0,
    totalResponseTime: 0,
    dbQueryCount: 0
};

// 📌 Middleware pour suivre les requêtes HTTP
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

// 📌 Suivi des requêtes MongoDB
export const trackDBQuery = (query) => {
    metrics.dbQueryCount++;
    const start = performance.now();

    query.exec((err, result) => {
        const duration = performance.now() - start;

        if (err) {
            logger.error(`Erreur dans la requête MongoDB [${query.op}] : ${err.message}`);
        } else {
            logger.debug(`DB Query [${query.op}] - ${duration.toFixed(2)}ms`);
        }
    });

    return query;
};

// 📌 Récupération des métriques
export const getMetrics = () => ({
    ...metrics,
    avgResponseTime: metrics.requestCount > 0
        ? metrics.totalResponseTime / metrics.requestCount
        : 0 // Évite une division par zéro
});