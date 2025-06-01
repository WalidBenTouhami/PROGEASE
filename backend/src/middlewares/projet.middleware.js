/**
 * Middleware de validation pour les projets
 * @module middlewares/projet
 * @author WalidBenTouhami
 * @version 2.0.0
 * @updated 2025-05-27
 */

'use strict';

const { ValidationError } = require('../middlewares/errorHandlers');
const logger = require('../utils/logger');

/**
 * Middleware de validation pour les requetes projet
 * @function validateProjet
 * @param {Object} req - Objet requete Express
 * @param {Object} res - Objet reponse Express
 * @param {Function} next - Fonction next
 */
const validateProjet = (schema) => async (req, res, next) => {
    try {
        // Valider les donnees avec le schema Yup fourni
        await schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            context: {
                utilisateur: req.utilisateur,
                operation: req.method === 'POST' ? 'create' : 'update',
                projetId: req.params.id
            }
        });

        // Validation reussie
        next();
    } catch (error) {
        // Convertir les erreurs Yup en format standardise
        const errors = error.inner.map(err => ({
            field: err.path,
            message: err.message,
            type: err.type
        }));

        // Journaliser l'erreur
        logger.warn('Validation du projet echouee', {
            path: req.path,
            method: req.method,
            errors
        });

        // Creer une erreur de validation standardisee
        const validationError = new ValidationError(
            'Validation du projet echouee',
            errors
        );

        // Passer l'erreur au gestionnaire central
        next(validationError);
    }
};

/**
 * Middleware pour verifier les autorisations de modification d'un projet
 * @function checkProjetPermissions
 * @param {Object} req - Objet requete Express
 * @param {Object} res - Objet reponse Express
 * @param {Function} next - Fonction next
 */
const checkProjetPermissions = async (req, res, next) => {
    try {
        // Si l'utilisateur est admin, autoriser toutes les operations
        if (req.utilisateur && req.utilisateur.role === 'ADMIN') {
            return next();
        }

        // Recuperer le projet
        const Projet = require('../models/projet.model');
        const projet = await Projet.findById(req.params.id);

        // Verifier si le projet existe
        if (!projet) {
            return next(new ValidationError('Projet introuvable'));
        }

        // Verifier si l'utilisateur est le createur ou le tuteur
        const isTuteur = projet.tuteur.equals(req.utilisateur._id);
        const isCreateur = projet.createur.equals(req.utilisateur._id);
        const isTeamMember = projet.equipe.some(membre => membre.equals(req.utilisateur._id));

        // Si c'est un membre de l'equipe et qu'on est en GET, autoriser
        if (req.method === 'GET' && (isTeamMember || isTuteur || isCreateur)) {
            return next();
        }

        // Pour les autres methodes, verifier les droits plus restrictifs
        if (isTuteur || isCreateur) {
            return next();
        }

        // Sinon, refutilisateur l'acces
        throw new ValidationError(
            'Vous n\'avez pas les autorisations necessaires pour cette operation',
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