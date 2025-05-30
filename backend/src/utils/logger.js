const winston = require('winston');
const path = require('path');
const fs = require('fs');

// S'assurer que le repertoire logs existe
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Configuration des niveaux de log
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

// Configuration du format
const format = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.json()
);

// Configuration du logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    defaultMeta: { service: 'progease-api' },
    transports: [
        // Logs console en developpement
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    info => `${info.timestamp} ${info.level}: ${info.message} ${
                        info.metadata ? JSON.stringify(info.metadata) : ''
                    }`
                )
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

// Reduction des logs en test
if (process.env.NODE_ENV === 'test') {
    logger.transports.forEach((t) => (t.silent = true));
}

// Ajout d'un niveau personnalise pour le monitoring
logger.monitoring = function(message, metadata) {
    this.log({
        level: 'info',
        message: `[MONITORING] ${message}`,
        monitoring: true,
        ...metadata
    });
};

// Ajout d'un niveau personnalise pour la securite
logger.security = function(message, metadata) {
    this.log({
        level: 'warn',
        message: `[SECURITY] ${message}`,
        security: true,
        ...metadata
    });
};

module.exports = logger;