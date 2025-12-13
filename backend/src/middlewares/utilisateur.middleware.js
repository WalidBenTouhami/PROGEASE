/**
 * Middleware d'authentification et d'autorisation pour les utilisateurs
 * @module middlewares/utilisateur
 * @author WalidBenTouhami
 * @version 2.1.0
 * @updated 2024-03-19
 */

'use strict';

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { ValidationError } = require('./errorHandlers');
const logger = require('../utils/logger');
const config = require('../config');
const {
    validateInscriptionData,
    validateConnexionData,
    validateMiseAJourProfilData,
    validateChangementMotDePasseData,
} = require('../validations/utilisateur.validation');
const Utilisateur = require('../models/utilisateur.model');
const { AppError } = require('../utils/appError');

/**
 * Limiteur de tentatives de connexion
 */
const limiterTentativesConnexion = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives maximum
    message: {
        succes: false,
        message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    },
});

/**
 * Middleware de validation pour l'inscription
 */
const validerInscription = async (req, res, next) => {
    try {
        const { email, motDePasse, nom, prenom } = req.body;
        const validationResult = validateInscriptionData({ email, motDePasse, nom, prenom });

        if (!validationResult.succes) {
            return res.status(400).json(validationResult);
        }

        // Vérification de l'unicité de l'email
        const emailExistant = await Utilisateur.findOne({ email });
        if (emailExistant) {
            return res.status(400).json({
                succes: false,
                message: 'Cet email est déjà utilisé',
            });
        }

        next();
    } catch (erreur) {
        logger.error("Erreur de validation d'inscription:", erreur);
        next(new AppError("Erreur lors de la validation des données d'inscription", 500));
    }
};

/**
 * Middleware de validation pour la connexion
 */
const validerConnexion = async (req, res, next) => {
    try {
        const { email, motDePasse } = req.body;
        const validationResult = validateConnexionData({ email, motDePasse });

        if (!validationResult.succes) {
            return res.status(400).json(validationResult);
        }

        next();
    } catch (erreur) {
        logger.error('Erreur de validation de connexion:', erreur);
        next(new AppError('Erreur lors de la validation des données de connexion', 500));
    }
};

/**
 * Middleware de validation pour la mise à jour du profil
 */
const validerMiseAJourProfil = async (req, res, next) => {
    try {
        const { nom, prenom, email } = req.body;
        const validationResult = validateMiseAJourProfilData({ nom, prenom, email });

        if (!validationResult.succes) {
            return res.status(400).json(validationResult);
        }

        next();
    } catch (erreur) {
        logger.error('Erreur de validation de mise à jour du profil:', erreur);
        next(new AppError('Erreur lors de la validation des données de profil', 500));
    }
};

/**
 * Middleware de validation pour le changement de mot de passe
 */
const validerChangementMotDePasse = async (req, res, next) => {
    try {
        const { ancienMotDePasse, nouveauMotDePasse } = req.body;
        const validationResult = validateChangementMotDePasseData({
            ancienMotDePasse,
            nouveauMotDePasse,
        });

        if (!validationResult.succes) {
            return res.status(400).json(validationResult);
        }

        next();
    } catch (erreur) {
        logger.error('Erreur de validation de changement de mot de passe:', erreur);
        next(new AppError('Erreur lors de la validation des données de mot de passe', 500));
    }
};

/**
 * Middleware pour vérifier le token JWT
 */
const verifierToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                succes: false,
                message: "Token d'authentification manquant",
            });
        }

        const decoded = jwt.verify(token, config.authentification.secret);
        const utilisateur = await Utilisateur.findById(decoded.id).select('-motDePasse');

        if (!utilisateur) {
            return res.status(401).json({
                succes: false,
                message: 'Utilisateur non trouvé',
            });
        }

        if (!utilisateur.actif) {
            return res.status(401).json({
                succes: false,
                message: 'Compte désactivé',
            });
        }

        req.utilisateur = utilisateur;
        next();
    } catch (erreur) {
        logger.error('Erreur de vérification du token:', erreur);
        return res.status(401).json({
            succes: false,
            message: 'Token invalide ou expiré',
        });
    }
};

/**
 * Middleware pour vérifier les rôles
 */
const verifierRole = roles => {
    return (req, res, next) => {
        if (!Array.isArray(roles)) {
            roles = [roles];
        }

        if (!roles.includes(req.utilisateur.role)) {
            return res.status(403).json({
                succes: false,
                message: 'Accès non autorisé: rôle insuffisant',
            });
        }
        next();
    };
};

/**
 * Middleware de vérification de propriété
 */
const verifierProprietaire = model => {
    return async (req, res, next) => {
        try {
            const ressource = await model.findById(req.params.id);

            if (!ressource) {
                return res.status(404).json({
                    succes: false,
                    message: 'Ressource non trouvée',
                });
            }

            if (
                ressource.utilisateur.toString() !== req.utilisateur.id &&
                req.utilisateur.role !== 'ADMIN'
            ) {
                return res.status(403).json({
                    succes: false,
                    message: "Accès non autorisé: vous n'êtes pas propriétaire de cette ressource",
                });
            }

            req.ressource = ressource;
            next();
        } catch (erreur) {
            logger.error('Erreur lors de la vérification du propriétaire:', erreur);
            next(new AppError("Erreur lors de la vérification des droits d'accès", 500));
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
            _id: { $ne: req.utilisateur.id },
        });

        if (utilisateurExistant) {
            return res.status(400).json({
                succes: false,
                message: 'Cet email est déjà utilisé par un autre utilisateur',
            });
        }

        next();
    } catch (erreur) {
        logger.error("Erreur lors de la vérification de l'email:", erreur);
        next(new AppError("Erreur lors de la vérification de l'unicité de l'email", 500));
    }
};

module.exports = {
    limiterTentativesConnexion,
    validerInscription,
    validerConnexion,
    validerMiseAJourProfil,
    validerChangementMotDePasse,
    verifierToken,
    verifierRole,
    verifierProprietaire,
    verifierEmailUnique,
};
