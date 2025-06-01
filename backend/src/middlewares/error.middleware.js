const { ApolloError } = require('apollo-server-express');
const { ValidationError } = require('apollo-server-express');
const { UserInputError } = require('apollo-server-express');
const { AuthenticationError } = require('apollo-server-express');
const { ForbiddenError } = require('apollo-server-express');

const errorHandler = (err, req, res, next) => {
    // Erreurs Apollo
    if (err instanceof ApolloError) {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }

    // Erreurs de validation
    if (err instanceof ValidationError) {
        return res.status(400).json({
            status: 'error',
            message: err.message,
            errors: err.extensions?.exception?.errors
        });
    }

    // Erreurs d'entrée utilisateur
    if (err instanceof UserInputError) {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }

    // Erreurs d'authentification
    if (err instanceof AuthenticationError) {
        return res.status(401).json({
            status: 'error',
            message: err.message
        });
    }

    // Erreurs d'autorisation
    if (err instanceof ForbiddenError) {
        return res.status(403).json({
            status: 'error',
            message: err.message
        });
    }

    // Erreurs Mongoose
    if (err.name === 'MongoError') {
        if (err.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'Un document avec cette valeur existe déjà'
            });
        }
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            status: 'error',
            message: 'Erreur de validation',
            errors
        });
    }

    // Erreurs JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: 'Token invalide'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: 'Token expiré'
        });
    }

    // Erreurs par défaut
    console.error('Erreur non gérée:', err);
    return res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production'
            ? 'Une erreur est survenue'
            : err.message
    });
};

module.exports = {
    errorHandler
}; 