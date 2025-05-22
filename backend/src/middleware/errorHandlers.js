// ./src/middleware/errorHandlers.js

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route introuvable - ${req.originalUrl}`, 404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log l'erreur en développement
    if (process.env.NODE_ENV === 'development') {
        console.error('Erreur :', {
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode
        });
    }

    // Gestion des erreurs de validation MongoDB
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        err.message = `Données invalides. ${errors.join('. ')}`;
        err.statusCode = 400;
    }

    // Gestion des erreurs de doublons MongoDB
    if (err.code === 11000) {
        const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
        err.message = `Valeur en doublon: ${value}. Veuillez utiliser une autre valeur`;
        err.statusCode = 400;
    }

    // Gestion des erreurs de cast MongoDB
    if (err.name === 'CastError') {
        err.message = `ID invalide: ${err.value}`;
        err.statusCode = 400;
    }

    // Réponse en production
    if (process.env.NODE_ENV === 'production') {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // Erreurs de programmation ou inconnues
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur inattendue est survenue'
        });
    }

    // Réponse en développement
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

module.exports = {
    AppError,
    notFoundHandler,
    errorHandler
}; 