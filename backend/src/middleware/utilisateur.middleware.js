const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/constants');
const Utilisateur = require('../models/utilisateur.model');
const logger = require('../utils/logger');

/**
 * Middleware d'authentification
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

        const decoded = jwt.verify(token, JWT_SECRET);
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
        logger.error('Erreur d\'authentification:', error);
        res.status(401).json({
            success: false,
            message: 'Token invalide ou expiré'
        });
    }
};

/**
 * Middleware de validation des rôles
 */
const verifierRole = (roles) => {
    return (req, res, next) => {
        if (!req.utilisateur) {
            return res.status(401).json({
                success: false,
                message: 'Non authentifié'
            });
        }

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
 * Middleware de validation des données utilisateur
 */
const validerDonneesUtilisateur = (req, res, next) => {
    const { nom, prenom, email, motDePasse } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs obligatoires doivent être remplis'
        });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Format d\'email invalide'
        });
    }

    // Validation mot de passe
    if (motDePasse.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Le mot de passe doit contenir au moins 8 caractères'
        });
    }

    next();
};

module.exports = {
    verifierToken,
    verifierRole,
    validerDonneesUtilisateur
}; 