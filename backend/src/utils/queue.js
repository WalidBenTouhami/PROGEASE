// src/utils/queue.js

import Bull from 'bull';
import { logger } from './logger.js';

const queues = new Map();

export const createQueue = (name, options = {}) => {
    if (queues.has(name)) return queues.get(name);

    const queue = new Bull(name, {
        redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            tls: process.env.NODE_ENV === 'production'
        },
        defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: 100,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000
            }
        },
        ...options
    });

    queue.on('failed', (job, err) => {
        logger.error(`Job ${job.id} failed: ${err.message}`);
        metrics.trackError('QUEUE_ERROR', job.name);
    });

    queues.set(name, queue);
    return queue;
};