/**
 * Middleware de validation pour les livrables
 * @module middlewares/livrable
 * @author WalidBenTouhami
 * @version 2.0.0
 * @updated 2025-05-27
 */

'use strict';

const { validationResult } = require('express-validator');
const { ValidationError } = require('../middleware/errorHandlers');
const logger = require('../utils/logger');

/**
 * Middleware de validation pour les requetes de livrables
 * @function validateLivrable
 * @param {Object} req - Objet requete Express
 * @param {Object} res - Objet reponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validateLivrable = (req, res, next) => {
    // Recuperer les erreurs de validation
    const errors = validationResult(req);

    // Si des erreurs sont presentes, les traiter
    if (!errors.isEmpty()) {
        // Formater les erreurs de validation
        const formattedErrors = errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value
        }));

        // Journaliser l'erreur
        logger.warn('Validation du livrable echouee', {
            path: req.path,
            method: req.method,
            errors: formattedErrors
        });

        // Creer une erreur de validation standardisee
        const validationError = new ValidationError(
            'Validation du livrable echouee',
            formattedErrors
        );

        // Passer l'erreur au gestionnaire central
        return next(validationError);
    }

    // Si aucune erreur, continuer
    next();
};

/**
 * Middleware pour verifier les autorisations d'acces à un livrable
 * @function checkLivrablePermissions
 * @param {Object} req - Objet requete Express
 * @param {Object} res - Objet reponse Express
 * @param {Function} next - Fonction next d'Express
 */
const checkLivrablePermissions = async (req, res, next) => {
    try {
        // Si l'utilisateur est admin, autoriser toutes les operations
        if (req.user && req.user.role === 'ADMIN') {
            return next();
        }

        // Recuperer le livrable et le projet associe
        const Livrable = require('../models/livrable.model');
        const Projet = require('../models/projet.model');

        const livrable = await Livrable.findById(req.params.id);

        // Verifier si le livrable existe
        if (!livrable) {
            return next(new ValidationError('Livrable introuvable'));
        }

        // Recuperer le projet associe
        const projet = await Projet.findById(livrable.projetId);

        // Verifier si l'utilisateur est le tuteur ou le createur du projet
        const isTuteur = projet.tuteur.equals(req.user._id);
        const isProjetCreateur = projet.createur.equals(req.user._id);
        const isLivrableCreateur = livrable.createur && livrable.createur.equals(req.user._id);
        const isTeamMember = projet.equipe.some(membre => membre.equals(req.user._id));

        // Pour les lectures, autoriser l'equipe
        if (req.method === 'GET' && (isTeamMember || isTuteur || isProjetCreateur || isLivrableCreateur)) {
            return next();
        }

        // Pour les modifications, verifier les droits plus restrictifs
        if (isTuteur || isProjetCreateur || isLivrableCreateur) {
            return next();
        }

        // Sinon, refuser l'acces
        throw new ValidationError(
            'Vous n\'avez pas les autorisations necessaires pour cette operation',
            403
        );
    } catch (error) {
        next(error);
    }
};

// Exportations pour compatibilite avec le code existant
module.exports = validateLivrable;

// Exportations des fonctions individuelles
module.exports.validateLivrable = validateLivrable;
module.exports.checkLivrablePermissions = checkLivrablePermissions;