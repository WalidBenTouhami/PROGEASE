const winston = require('winston');
const { format } = winston;
const { combine, timestamp, printf, colorize, json } = format;
const path = require('path');
const config = require('../config');

// Format personnalisé pour les logs
const formatLog = printf(({ niveau, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${niveau}] : ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

// Configuration des transports
const transports = [
    // Transport console avec couleurs
    new winston.transports.Console({
        format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), formatLog),
    }),
    // Transport fichier pour les erreurs
    new winston.transports.File({
        filename: path.join('logs', 'erreurs.log'),
        level: 'error',
        format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true,
    }),
    // Transport fichier pour tous les logs
    new winston.transports.File({
        filename: path.join('logs', 'application.log'),
        format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true,
    }),
];

// Ajout de transports supplémentaires en développement
if (config.server.env === 'development') {
    transports.push(
        new winston.transports.File({
            filename: path.join('logs', 'debug.log'),
            level: 'debug',
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
        })
    );
}

// Création du logger
const logger = winston.createLogger({
    level: config.logging.level,
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
    defaultMeta: { service: 'progease-api' },
    transports,
    // Gestion des exceptions non capturées
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join('logs', 'exceptions.log'),
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
        }),
    ],
    // Gestion des rejets de promesses non capturés
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join('logs', 'rejets.log'),
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
        }),
    ],
});

// Méthodes utilitaires
logger.requete = (req, res, next) => {
    const debut = Date.now();
    res.on('finish', () => {
        const duree = Date.now() - debut;
        logger.info('Requête HTTP', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duree: `${duree}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });
    next();
};

logger.erreur = (err, req, res, next) => {
    logger.error('Erreur serveur', {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    next(err);
};

module.exports = logger;
