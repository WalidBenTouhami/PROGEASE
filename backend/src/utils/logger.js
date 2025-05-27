const winston = require('winston');
const path = require('path');
const fs = require('fs');

// S'assurer que le répertoire logs existe
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Format personnalisé
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    const metaStr = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`;
});

// Configuration du logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.metadata(),
        customFormat
    ),
    defaultMeta: { service: 'progease-api' },
    transports: [
        // Logs console en développement
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        }),

        // Logs asynchrones vers fichier
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
    ],
    exitOnError: false, // Ne pas quitter en cas d'erreur
    handleExceptions: true,
    handleRejections: true
});

// Réduction des logs en test
if (process.env.NODE_ENV === 'test') {
    logger.transports.forEach((t) => (t.silent = true));
}

// Ajout d'un niveau personnalisé pour le monitoring
logger.monitoring = function(message, metadata) {
    this.log({
        level: 'info',
        message: `[MONITORING] ${message}`,
        monitoring: true,
        ...metadata
    });
};

// Ajout d'un niveau personnalisé pour la sécurité
logger.security = function(message, metadata) {
    this.log({
        level: 'warn',
        message: `[SECURITY] ${message}`,
        security: true,
        ...metadata
    });
};

module.exports = logger;