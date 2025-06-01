/**
 * Middleware d'authentification et d'autorisation pour les utilisateurs
 * @module middlewares/utilisateur
 * @author WalidBenTouhami
 * @version 2.0.0
 * @updated 2025-06-01
 */

'use strict';

const jwt = require('jsonwebtoken');
const { ValidationError } = require('./errorHandlers');
const logger = require('../utils/logger');
const { JWT_SECRET, Enums, MessagesErreur, StatutHttp } = require('../../config/constants');
const { validateInscriptionData, validateConnexionData, validateMiseAJourProfilData, validateChangementMotDePasseData, validateId } = require('../validations/utilisateur.validation');
const Utilisateur = require('../models/utilisateur.model');
const { AppError } = require('../utils/appError');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const config = require('../config');

/**
 * Middleware de validation pour l'inscription
 */
const validateInscription = (req, res, next) => {
    const { email, motDePasse, nom, prenom } = req.body;

    if (!email || !motDePasse || !nom || !prenom) {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs sont requis'
        });
    }

    if (motDePasse.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Le mot de passe doit contenir au moins 8 caractères'
        });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({
            success: false,
            message: 'Format d\'email invalide'
        });
    }

    next();
};

/**
 * Middleware de validation pour la connexion
 */
const validateConnexion = (req, res, next) => {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
        return res.status(400).json({
            success: false,
            message: 'Email et mot de passe requis'
        });
    }

    next();
};

/**
 * Middleware de validation pour la mise à jour du profil
 */
const validateMiseAJourProfil = (req, res, next) => {
    const { nom, prenom, email } = req.body;

    if (!nom || !prenom || !email) {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs sont requis'
        });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({
            success: false,
            message: 'Format d\'email invalide'
        });
    }

    next();
};

/**
 * Middleware de validation pour le changement de mot de passe
 */
const validateChangementMotDePasse = (req, res, next) => {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    if (!ancienMotDePasse || !nouveauMotDePasse) {
        return res.status(400).json({
            success: false,
            message: 'Ancien et nouveau mot de passe requis'
        });
    }

    if (nouveauMotDePasse.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Le nouveau mot de passe doit contenir au moins 8 caractères'
        });
    }

    next();
};

/**
 * Middleware pour vérifier le token JWT
 */
const verifierToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification manquant'
            });
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        const utilisateur = await Utilisateur.findById(decoded.id);

        if (!utilisateur) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        req.utilisateur = utilisateur;
        next();
    } catch (error) {
        logger.error('Erreur de vérification du token:', error);
        return res.status(401).json({
            success: false,
            message: 'Token invalide'
        });
    }
};

/**
 * Middleware pour vérifier les rôles
 */
const verifierRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.utilisateur.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }
        next();
    };
};

/**
 * Middleware de vérification de propriété
 */
const verifierProprietaire = (model) => {
    return async (req, res, next) => {
        try {
            const resource = await model.findById(req.params.id);
            
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Ressource non trouvée'
                });
            }

            if (resource.utilisateur.toString() !== req.utilisateur.id && req.utilisateur.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            next();
        } catch (error) {
            logger.error('Erreur lors de la vérification du propriétaire:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification du propriétaire'
            });
        }
    };
};

/**
 * Middleware de vérification d'email unique
 */
const verifierEmailUnique = async (req, res, next) => {
    try {
        const { email } = req.body;
        const utilisateurExistant = await Utilisateur.findOne({ 
            email, 
            _id: { $ne: req.utilisateur.id } 
        });

        if (utilisateurExistant) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        next();
    } catch (error) {
        logger.error('Erreur lors de la vérification de l\'email:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification de l\'email'
        });
    }
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
const estAuthentifie = async (req, res, next) => {
    try {
        if (!req.utilisateur) {
            throw new AuthenticationError(MessagesErreur.AUTHENTIFICATION.NON_AUTHENTIFIE);
        }
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Vérifie si l'utilisateur a le rôle requis
 * @param {...string} roles - Rôles autorisés
 */
const aRole = (...roles) => {
    return async (req, res, next) => {
        try {
            if (!req.utilisateur) {
                throw new AuthenticationError(MessagesErreur.AUTHENTIFICATION.NON_AUTHENTIFIE);
            }

            if (!roles.includes(req.utilisateur.role)) {
                throw new AuthenticationError(MessagesErreur.AUTHENTIFICATION.NON_AUTORISE);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Vérifie si l'utilisateur est le propriétaire de la ressource
 * @param {string} modelName - Nom du modèle
 * @param {string} paramId - Nom du paramètre contenant l'ID
 */
const estProprietaire = (modelName, paramId) => {
    return async (req, res, next) => {
        try {
            if (!req.utilisateur) {
                throw new AuthenticationError(MessagesErreur.AUTHENTIFICATION.NON_AUTHENTIFIE);
            }

            const Model = require(`../models/${modelName}.model`);
            const resource = await Model.findById(req.params[paramId]);

            if (!resource) {
                throw new Error(MessagesErreur.RESSOURCE.NON_TROUVE);
            }

            if (resource.utilisateur.toString() !== req.utilisateur.id && req.utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError(MessagesErreur.AUTHENTIFICATION.NON_AUTORISE);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    validateInscription,
    validateConnexion,
    validateMiseAJourProfil,
    validateChangementMotDePasse,
    verifierToken,
    verifierRole,
    verifierProprietaire,
    verifierEmailUnique,
    estAuthentifie,
    aRole,
    estProprietaire
}; 