// src/core/db.js

import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectionOptions = {
    maxPoolSize: 15,
    minPoolSize: 5,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    w: 'majority'
};

let connection = null;

export async function connectToDatabase(config = {}) {
    if (connection) return connection;

    try {
        connection = await mongoose.createConnection(process.env.MONGODB_URI, {
            ...connectionOptions,
            ...config
        });

        connection.on('connected', () =>
            logger.info('MongoDB connection established')
        );

        connection.on('disconnected', () =>
            logger.warn('MongoDB connection lost')
        );

        connection.on('reconnected', () =>
            logger.info('MongoDB connection reestablished')
        );

        return connection;

    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
}