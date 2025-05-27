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
 * Middleware de validation pour les requêtes de livrables
 * @function validateLivrable
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validateLivrable = (req, res, next) => {
    // Récupérer les erreurs de validation
    const errors = validationResult(req);

    // Si des erreurs sont présentes, les traiter
    if (!errors.isEmpty()) {
        // Formater les erreurs de validation
        const formattedErrors = errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value
        }));

        // Journaliser l'erreur
        logger.warn('Validation du livrable échouée', {
            path: req.path,
            method: req.method,
            errors: formattedErrors
        });

        // Créer une erreur de validation standardisée
        const validationError = new ValidationError(
            'Validation du livrable échouée',
            formattedErrors
        );

        // Passer l'erreur au gestionnaire central
        return next(validationError);
    }

    // Si aucune erreur, continuer
    next();
};

/**
 * Middleware pour vérifier les autorisations d'accès à un livrable
 * @function checkLivrablePermissions
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const checkLivrablePermissions = async (req, res, next) => {
    try {
        // Si l'utilisateur est admin, autoriser toutes les opérations
        if (req.user && req.user.role === 'ADMIN') {
            return next();
        }

        // Récupérer le livrable et le projet associé
        const Livrable = require('../models/livrable.model');
        const Projet = require('../models/projet.model');

        const livrable = await Livrable.findById(req.params.id);

        // Vérifier si le livrable existe
        if (!livrable) {
            return next(new ValidationError('Livrable introuvable'));
        }

        // Récupérer le projet associé
        const projet = await Projet.findById(livrable.projetId);

        // Vérifier si l'utilisateur est le tuteur ou le créateur du projet
        const isTuteur = projet.tuteur.equals(req.user._id);
        const isProjetCreateur = projet.createur.equals(req.user._id);
        const isLivrableCreateur = livrable.createur && livrable.createur.equals(req.user._id);
        const isTeamMember = projet.equipe.some(membre => membre.equals(req.user._id));

        // Pour les lectures, autoriser l'équipe
        if (req.method === 'GET' && (isTeamMember || isTuteur || isProjetCreateur || isLivrableCreateur)) {
            return next();
        }

        // Pour les modifications, vérifier les droits plus restrictifs
        if (isTuteur || isProjetCreateur || isLivrableCreateur) {
            return next();
        }

        // Sinon, refuser l'accès
        throw new ValidationError(
            'Vous n\'avez pas les autorisations nécessaires pour cette opération',
            403
        );
    } catch (error) {
        next(error);
    }
};

// Exportations pour compatibilité avec le code existant
module.exports = validateLivrable;

// Exportations des fonctions individuelles
module.exports.validateLivrable = validateLivrable;
module.exports.checkLivrablePermissions = checkLivrablePermissions;