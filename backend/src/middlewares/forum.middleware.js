/**
 * Middleware de validation pour le forum
 * @module middlewares/forum
 * @author WalidBenTouhami
 * @version 2.0.0
 * @updated 2025-06-01
 */

'use strict';

const { ValidationError } = require('./errorHandlers');
const logger = require('../utils/logger');
const { validateSujetData, validateReponseData, validateVoteData, validateId } = require('../validations/forum.validation');
const { Sujet } = require('../models/forum.model');

/**
 * Middleware de validation pour les sujets
 */
const validateSujet = async (req, res, next) => {
    try {
        await validateSujetData(req.body);
        next();
    } catch (error) {
        logger.warn('Validation du sujet échouée', {
            path: req.path,
            method: req.method,
            errors: error.details
        });
        next(new ValidationError('Validation du sujet échouée', error.details));
    }
};

/**
 * Middleware de validation pour les réponses
 */
const validateReponse = async (req, res, next) => {
    try {
        await validateReponseData(req.body);
        next();
    } catch (error) {
        logger.warn('Validation de la réponse échouée', {
            path: req.path,
            method: req.method,
            errors: error.details
        });
        next(new ValidationError('Validation de la réponse échouée', error.details));
    }
};

/**
 * Middleware de validation pour les votes
 */
const validateVote = async (req, res, next) => {
    try {
        await validateVoteData(req.body);
        next();
    } catch (error) {
        logger.warn('Validation du vote échouée', {
            path: req.path,
            method: req.method,
            errors: error.details
        });
        next(new ValidationError('Validation du vote échouée', error.details));
    }
};

/**
 * Middleware pour vérifier si l'utilisateur est l'auteur du sujet
 */
const estAuteurSujet = async (req, res, next) => {
    try {
        validateId(req.params.sujetId);

        const sujet = await Sujet.findById(req.params.sujetId);
        if (!sujet) {
            return res.status(404).json({
                success: false,
                message: 'Sujet non trouvé'
            });
        }

        if (sujet.auteur.toString() !== req.utilisateur.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé - Vous n\'êtes pas l\'auteur de ce sujet'
            });
        }

        req.sujet = sujet;
        next();
    } catch (error) {
        logger.error('Erreur lors de la vérification de l\'auteur du sujet:', error);
        next(error);
    }
};

/**
 * Middleware pour vérifier si l'utilisateur est l'auteur de la réponse
 */
const estAuteurReponse = async (req, res, next) => {
    try {
        validateId(req.params.sujetId);
        validateId(req.params.reponseId);

        const sujet = await Sujet.findById(req.params.sujetId);
        if (!sujet) {
            return res.status(404).json({
                success: false,
                message: 'Sujet non trouvé'
            });
        }

        const reponse = sujet.reponses.id(req.params.reponseId);
        if (!reponse) {
            return res.status(404).json({
                success: false,
                message: 'Réponse non trouvée'
            });
        }

        if (reponse.auteur.toString() !== req.utilisateur.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé - Vous n\'êtes pas l\'auteur de cette réponse'
            });
        }

        req.sujet = sujet;
        req.reponse = reponse;
        next();
    } catch (error) {
        logger.error('Erreur lors de la vérification de l\'auteur de la réponse:', error);
        next(error);
    }
};

/**
 * Middleware pour vérifier les permissions sur le forum
 */
const checkForumPermissions = (action) => async (req, res, next) => {
    try {
        const utilisateur = req.utilisateur;
        if (!utilisateur) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }

        // Vérifier les permissions selon l'action
        switch (action) {
            case 'create':
                // Tout utilisateur authentifié peut créer
                break;
            case 'update':
            case 'delete':
                // Vérifier si l'utilisateur est l'auteur ou un administrateur
                const sujet = await Sujet.findById(req.params.sujetId);
                if (!sujet) {
                    return res.status(404).json({
                        success: false,
                        message: 'Sujet non trouvé'
                    });
                }
                if (sujet.auteur.toString() !== utilisateur.id && !utilisateur.roles.includes('ADMIN')) {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès non autorisé'
                    });
                }
                break;
            case 'moderate':
                // Seuls les modérateurs et administrateurs peuvent modérer
                if (!utilisateur.roles.some(role => ['ADMIN', 'MODERATEUR'].includes(role))) {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès non autorisé - Droits de modération requis'
                    });
                }
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Action non reconnue'
                });
        }

        next();
    } catch (error) {
        logger.error('Erreur lors de la vérification des permissions:', error);
        next(error);
    }
};

module.exports = {
    validateSujet,
    validateReponse,
    validateVote,
    estAuteurSujet,
    estAuteurReponse,
    checkForumPermissions
}; 