const logger = require('../utils/logger');
const { ERROR_CODES, MessagesErreur, StatutHttp } = require('../../config/constants');

class AppError extends Error {
    constructor(
        message,
        statusCode = 500,
        code = ERROR_CODES.INTERNAL_ERROR,
        isOperational = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details) {
        super(message, StatutHttp.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
        this.details = details;
    }
}

const notFoundHandler = (req, res, next) => {
    next(
        new AppError(
            `Route ${req.originalUrl} non trouvée`,
            StatutHttp.NOT_FOUND,
            ERROR_CODES.NOT_FOUND,
            true
        )
    );
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || StatutHttp.INTERNAL_ERROR;
    err.code = err.code || ERROR_CODES.INTERNAL_ERROR;

    // Log l'erreur
    if (err.statusCode === StatutHttp.INTERNAL_ERROR) {
        logger.error('Erreur serveur:', {
            error: err.message,
            stack: err.stack,
            code: err.code,
            path: req.path,
            method: req.method,
        });
    } else {
        logger.warn('Erreur client:', {
            error: err.message,
            code: err.code,
            path: req.path,
            method: req.method,
        });
    }

    // Réponse d'erreur
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        code: err.code,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err.details,
        }),
    });
};

const setupProcessErrorHandlers = () => {
    process.on('uncaughtException', err => {
        logger.error('Uncaught Exception:', err);
        process.exit(1);
    });

    process.on('unhandledRejection', err => {
        logger.error('Unhandled Rejection:', err);
        process.exit(1);
    });
};

const setupHttpErrorHandlers = (server, port) => {
    server.on('error', error => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

        switch (error.code) {
            case 'EACCES':
                logger.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                logger.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
};

module.exports = {
    AppError,
    ValidationError,
    notFoundHandler,
    errorHandler,
    setupProcessErrorHandlers,
    setupHttpErrorHandlers,
};
