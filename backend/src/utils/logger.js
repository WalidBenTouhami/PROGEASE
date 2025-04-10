// src/utils/logger.js

const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
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
 * @param {string} context - Nom du contexte ('queue')
 * @returns {object} Logger configuré
 */
function createLoggerWithContext(context) {
    return {
        info: (message, meta) => logger.info(`[${context}] ${message}`, meta),
        error: (message, meta) => logger.error(`[${context}] ${message}`, meta),
        warn: (message, meta) => logger.warn(`[${context}] ${message}`, meta),
        debug: (message, meta) => logger.debug(`[${context}] ${message}`, meta)
    };
}

module.exports = { createLogger: createLoggerWithContext };