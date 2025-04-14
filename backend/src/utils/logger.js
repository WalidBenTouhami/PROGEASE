// src/utils/logger.js

import { createLogger as winstonCreateLogger, format, transports } from 'winston';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const baseLogger = winstonCreateLogger({
    level: LOG_LEVEL,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, ...meta }) => {
            const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'application.log' })
    ]
});

/**
 * Crée un logger avec un nom de contexte
 * @param {string} context - Nom du contexte
 * @returns {object} Logger configuré
 */
export const createLogger = (context) => ({
    info: (message, meta) => baseLogger.info(`[${context}] ${message}`, meta),
    error: (message, meta) => baseLogger.error(`[${context}] ${message}`, meta),
    warn: (message, meta) => baseLogger.warn(`[${context}] ${message}`, meta),
    debug: (message, meta) => baseLogger.debug(`[${context}] ${message}`, meta)
});

export default baseLogger;