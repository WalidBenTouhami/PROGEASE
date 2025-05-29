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
 * @param {string} defaultMessage - Message par defaut
 * @param {string} [requestId] - ID de requete pour le traçage
 * @returns {AppError} Erreur formatee
 */
function handleMongooseError(error, defaultMessage = 'Erreur de base de donnees', requestId = null) {
    // Si c'est dejà une AppError, on la retourne directement
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
            `Donnees invalides: ${errors.join('. ')}`,
            400,
            ERROR_CODES.VALIDATION,
            true
        );
    }

    // Erreurs de cle dupliquee (index unique)
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return new AppError(
            `La valeur '${error.keyValue[field]}' est dejà utilisee pour le champ '${field}'`,
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
            'Delai d\'attente depasse pour la requete à la base de donnees',
            504,
            ERROR_CODES.TIMEOUT,
            false
        );
    }

    // Erreurs de reseau
    if (error.name === 'MongoNetworkError') {
        return new AppError(
            'Probleme de connexion à la base de donnees',
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