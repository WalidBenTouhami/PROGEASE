const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Création du dossier de logs s'il n'existe pas
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Format pour la console avec couleurs
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => {
        const { timestamp, level, message, stack, ...meta } = info;
        const metaStr = Object.keys(meta).length && meta.service ? '' :
            `\n${JSON.stringify(meta, null, 2)}`;
        return `[${timestamp}] [${level}]: ${message}${metaStr}${stack ? `\n${stack}` : ''}`;
    })
);

// Création du logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: winston.config.npm.levels,
    defaultMeta: { service: 'progease-backend' },
    transports: [
        // Logs d'erreur dans un fichier séparé
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: customFormat
        }),
        // Tous les logs dans un fichier combiné
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: customFormat
        }),
        // Console pour le développement
        new winston.transports.Console({
            format: consoleFormat
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log'),
            format: customFormat
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log'),
            format: customFormat
        })
    ]
});

module.exports = logger;