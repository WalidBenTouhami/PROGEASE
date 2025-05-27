/**
 * Utilitaires de gestion des erreurs Mongoose
 * @module utils/errorUtils
 */

'use strict';

const { AppError, ERROR_CODES } = require('../middleware/errorHandlers');
const logger = require('./logger');

/**
 * Transforme une erreur Mongoose en AppError
 * @param {Error} error - Erreur d'origine
 * @param {string} defaultMessage - Message par défaut
 * @param {string} [requestId] - ID de requête pour le traçage
 * @returns {AppError} Erreur formatée
 */
function handleMongooseError(error, defaultMessage = 'Erreur de base de données', requestId = null) {
    // Si c'est déjà une AppError, on la retourne directement
    if (error instanceof AppError) {
        return error;
    }

    // Log de l'erreur d'origine
    logger.debug(`Traitement de l'erreur Mongoose: ${error.message}`, {
        name: error.name,
        code: error.code,
        stack: error.stack,
        requestId
    });

    // Erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return new AppError(
            `Données invalides: ${errors.join('. ')}`,
            400,
            ERROR_CODES.VALIDATION,
            true
        );
    }

    // Erreurs de clé dupliquée (index unique)
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return new AppError(
            `La valeur '${error.keyValue[field]}' est déjà utilisée pour le champ '${field}'`,
            400,
            ERROR_CODES.DUPLICATE,
            true
        );
    }

    // Erreurs de conversion (mauvais format d'ID par exemple)
    if (error.name === 'CastError') {
        return new AppError(
            `Format invalide pour ${error.path}: ${error.value}`,
            400,
            ERROR_CODES.BAD_REQUEST,
            true
        );
    }

    // Erreurs de timeout de connexion
    if (error.name === 'MongoTimeoutError') {
        return new AppError(
            'Délai d\'attente dépassé pour la requête à la base de données',
            504,
            ERROR_CODES.TIMEOUT,
            false
        );
    }

    // Erreurs de réseau
    if (error.name === 'MongoNetworkError') {
        return new AppError(
            'Problème de connexion à la base de données',
            503,
            ERROR_CODES.DATABASE,
            false
        );
    }

    // Erreurs inconnues
    return new AppError(
        defaultMessage,
        500,
        ERROR_CODES.SERVER_ERROR,
        false
    );
}

module.exports = {
    handleMongooseError
};