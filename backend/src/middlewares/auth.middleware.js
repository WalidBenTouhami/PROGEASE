const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const { Utilisateur } = require('../models/utilisateur.model');
const config = require('../config');
const { AppError } = require('../utils/appError');
const { MessagesErreur, StatutHttp } = require('../../config/constants');

// Middleware pour protéger les routes
const protegerRoute = async (req, res, next) => {
    try {
        // Extraire le token du header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            req.utilisateur = null;
            return next();
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

        if (!token) {
            req.utilisateur = null;
            return next();
        }

        try {
            // Vérifier et décoder le token
            const decoded = jwt.verify(token, config.jwtSecret);

            // Récupérer l'utilisateur
            const utilisateur = await Utilisateur.findById(decoded.id).select('-motDePasse');

            if (!utilisateur) {
                throw new AuthenticationError('Utilisateur non trouvé');
            }

            if (!utilisateur.estActif) {
                throw new AuthenticationError('Compte désactivé');
            }

            // Ajouter l'utilisateur à la requête
            req.utilisateur = utilisateur;
            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AuthenticationError('Token invalide');
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new AuthenticationError('Token expiré');
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

// Middleware pour restreindre l'accès à certains rôles
const restreindreA = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.utilisateur.role)) {
            return next(
                new AppError("Vous n'avez pas la permission d'effectuer cette action.", 403)
            );
        }
        next();
    };
};

module.exports = {
    protegerRoute,
    restreindreA,
};
