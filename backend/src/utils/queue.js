// utils/queue.js
const Bull = require('bull');
const Redis = require('ioredis');
const { createLogger } = require('./logger');
const logger = createLogger('queue');

// 🔧 Configuration via environnement
const REDIS_CONFIG = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
};

class QueueService {
    constructor() {
        this.queues = new Map();
        this.redisClient = new Redis(REDIS_CONFIG);
        this.setupErrorHandlers();
    }

    /**
     * Crée ou récupère une file d'attente
     * @param {string} name - Nom de la file d'attente
     * @param {object} options - Options Bull personnalisées
     * @returns {Bull.Queue}
     */
    createQueue(name, options = {}) {
        if (this.queues.has(name)) {
            return this.queues.get(name);
        }

        const queue = new Bull(name, {
            redis: REDIS_CONFIG,
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

        this.setupQueueHandlers(queue);
        this.queues.set(name, queue);

        return queue;
    }

    /**
     * Configure les handlers d'événements pour une queue
     * @param {Bull.Queue} queue
     */
    setupQueueHandlers(queue) {
        queue
            .on('completed', (job) => {
                logger.info(`Job ${job.id} completed in ${queue.name}`);
                job.remove();
            })
            .on('failed', (job, err) => {
                logger.error(`Job ${job.id} failed in ${queue.name}: ${err.message}`, {
                    stack: err.stack,
                    data: job.data
                });
            })
            .on('stalled', (job) => {
                logger.warn(`Job ${job.id} stalled in ${queue.name}`);
            });

        // Monitoring des erreurs Redis
        queue.on('error', (err) => {
            logger.error(`Queue ${queue.name} error: ${err.message}`);
        });
    }

    setupErrorHandlers() {
        this.redisClient.on('error', (err) => {
            logger.error(`Redis error: ${err.message}`);
        });
    }

    /**
     * Middleware de logging pour les jobs
     */
    get jobMiddleware() {
        return (job, done) => {
            logger.info(`Processing job ${job.id} in ${job.queue.name}`, {
                data: job.data
            });
            done();
        };
    }

    /**
     * Fermeture propre des queues
     */
    async gracefulShutdown() {
        await Promise.all(
            Array.from(this.queues.values()).map(queue =>
                queue.close(true)
            )
        );
        await this.redisClient.quit();
        logger.info('All queues stopped');
    }
}

// 🔥 Exemple de configuration pour les rappels
const queueService = new QueueService();

// File d'attente pour les rappels
const remindersQueue = queueService.createQueue('reminders', {
    limiter: {
        max: 1000,
        duration: 5000
    }
});

// Processeur de jobs pour les rappels
remindersQueue.process('sendReminder', 5, async (job) => {
    const { emails, deliverableName, deadline } = job.data;

    await EmailService.sendReminder(
        emails,
        `Rappel : ${deliverableName}`,
        `Date limite : ${new Date(deadline).toLocaleDateString()}`
    );
});

// Middleware de sécurité
remindersQueue.use(queueService.jobMiddleware);

module.exports = {
    QueueService,
    createBullQueue: (name) => queueService.createQueue(name),
    remindersQueue
};