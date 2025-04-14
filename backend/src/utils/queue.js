// src/utils/queue.js

                import Bull from 'bull';
                import { createLogger } from './logger.js';

                const logger = createLogger('QueueUtils');
                const queues = new Map();

                export const createQueue = (name, options = {}) => {
                    if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
                        logger.error('Les variables d\'environnement REDIS_HOST et REDIS_PORT doivent être définies.');
                        throw new Error('Configuration Redis manquante.');
                    }

                    if (queues.has(name)) {
                        logger.info(`La file d'attente "${name}" existe déjà.`);
                        return queues.get(name);
                    }

                    try {
                        const queue = new Bull(name, {
                            redis: {
                                host: process.env.REDIS_HOST,
                                port: parseInt(process.env.REDIS_PORT, 10),
                                ...(process.env.NODE_ENV === 'production' && { tls: {} })
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
                            logger.error(`Le job ${job.id} a échoué : ${err.message}`, { jobName: job.name, stack: err.stack });
                        });

                        queue.on('completed', (job) => {
                            logger.info(`Le job ${job.id} a été complété avec succès.`, { jobName: job.name });
                        });

                        queues.set(name, queue);
                        logger.info(`File d'attente "${name}" créée avec succès.`);
                        return queue;
                    } catch (error) {
                        logger.error(`Erreur lors de la création de la file d'attente "${name}" : ${error.message}`, { stack: error.stack });
                        throw error;
                    }
                };