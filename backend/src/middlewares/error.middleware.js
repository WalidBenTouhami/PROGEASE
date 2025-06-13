const { ApolloError, ValidationError, UserInputError, AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { MongoError } = require('mongodb');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const { ValidationError: MongooseValidationError } = require('mongoose');
const logger = require('../utils/logger');
const config = require('../config');
const { AppError } = require('../utils/appError');

/**
 * Gestionnaire d'erreurs global
 */
const gestionnaireErreurs = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'erreur';

    // Journalisation des erreurs
    logger.error('Erreur:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    // Gestion des erreurs en fonction de l'environnement
    if (config.serveur.environnement === 'development') {
        return res.status(err.statusCode).json({
            succes: false,
            message: err.message,
            erreur: err,
            stack: err.stack
        });
    }

    // Gestion des erreurs en production
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            succes: false,
            message: err.message
        });
    }

    // Erreurs Apollo
    if (err instanceof ApolloError) {
        return res.status(400).json({
            succes: false,
            message: err.message,
            code: err.extensions?.code
        });
    }

    // Erreurs de validation
    if (err instanceof ValidationError) {
        return res.status(400).json({
            succes: false,
            message: err.message,
            erreurs: err.extensions?.exception?.errors
        });
    }

    // Erreurs d'entrée utilisateur
    if (err instanceof UserInputError) {
        return res.status(400).json({
            succes: false,
            message: err.message,
            erreurs: err.extensions?.exception?.errors
        });
    }

    // Erreurs d'authentification
    if (err instanceof AuthenticationError) {
        return res.status(401).json({
            succes: false,
            message: err.message
        });
    }

    // Erreurs d'autorisation
    if (err instanceof ForbiddenError) {
        return res.status(403).json({
            succes: false,
            message: err.message
        });
    }

    // Erreurs MongoDB
    if (err instanceof MongoError) {
        if (err.code === 11000) {
            const champ = Object.keys(err.keyPattern)[0];
            return res.status(400).json({
                succes: false,
                message: `Un document avec cette valeur de ${champ} existe déjà`
            });
        }
    }

    // Erreurs Mongoose
    if (err instanceof MongooseValidationError) {
        const erreurs = Object.values(err.errors).map(erreur => erreur.message);
        return res.status(400).json({
            succes: false,
            message: 'Erreur de validation des données',
            erreurs
        });
    }

    // Erreurs JWT
    if (err instanceof JsonWebTokenError) {
        return res.status(401).json({
            succes: false,
            message: 'Token d\'authentification invalide'
        });
    }

    if (err instanceof TokenExpiredError) {
        return res.status(401).json({
            succes: false,
            message: 'Token d\'authentification expiré'
        });
    }

    // Erreurs inattendues
    logger.error('Erreur non gérée:', err);
    return res.status(500).json({
        succes: false,
        message: 'Une erreur inattendue est survenue'
    });
};

/**
 * Gestionnaire d'erreurs pour les routes non trouvées
 */
const routeNonTrouvee = (req, res, next) => {
    next(new AppError(`Route non trouvée: ${req.originalUrl}`, 404));
};

/**
 * Gestionnaire d'erreurs pour les requêtes non autorisées
 */
const requeteNonAutorisee = (req, res, next) => {
    next(new AppError('Méthode non autorisée', 405));
};

module.exports = {
    gestionnaireErreurs,
    routeNonTrouvee,
    requeteNonAutorisee
}; 