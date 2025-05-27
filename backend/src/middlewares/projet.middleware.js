/**
 * Middleware de validation pour les projets
 * @module middlewares/projet
 * @author WalidBenTouhami
 * @version 2.0.0
 * @updated 2025-05-27
 */

'use strict';

const { ValidationError } = require('../middleware/errorHandlers');
const logger = require('../utils/logger');

/**
 * Middleware de validation pour les requêtes projet
 * @function validateProjet
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next
 */
const validateProjet = (schema) => async (req, res, next) => {
    try {
        // Valider les données avec le schéma Yup fourni
        await schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            context: {
                user: req.user,
                operation: req.method === 'POST' ? 'create' : 'update',
                projetId: req.params.id
            }
        });

        // Validation réussie
        next();
    } catch (error) {
        // Convertir les erreurs Yup en format standardisé
        const errors = error.inner.map(err => ({
            field: err.path,
            message: err.message,
            type: err.type
        }));

        // Journaliser l'erreur
        logger.warn('Validation du projet échouée', {
            path: req.path,
            method: req.method,
            errors
        });

        // Créer une erreur de validation standardisée
        const validationError = new ValidationError(
            'Validation du projet échouée',
            errors
        );

        // Passer l'erreur au gestionnaire central
        next(validationError);
    }
};

/**
 * Middleware pour vérifier les autorisations de modification d'un projet
 * @function checkProjetPermissions
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next
 */
const checkProjetPermissions = async (req, res, next) => {
    try {
        // Si l'utilisateur est admin, autoriser toutes les opérations
        if (req.user && req.user.role === 'ADMIN') {
            return next();
        }

        // Récupérer le projet
        const Projet = require('../models/projet.model');
        const projet = await Projet.findById(req.params.id);

        // Vérifier si le projet existe
        if (!projet) {
            return next(new ValidationError('Projet introuvable'));
        }

        // Vérifier si l'utilisateur est le créateur ou le tuteur
        const isTuteur = projet.tuteur.equals(req.user._id);
        const isCreateur = projet.createur.equals(req.user._id);
        const isTeamMember = projet.equipe.some(membre => membre.equals(req.user._id));

        // Si c'est un membre de l'équipe et qu'on est en GET, autoriser
        if (req.method === 'GET' && (isTeamMember || isTuteur || isCreateur)) {
            return next();
        }

        // Pour les autres méthodes, vérifier les droits plus restrictifs
        if (isTuteur || isCreateur) {
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

module.exports = {
    validateProjet,
    checkProjetPermissions
};