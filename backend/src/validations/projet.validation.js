/**
 * Schémas de validation Yup pour les projets
 * @module validations/projet.validation
 * @author WalidBenTouhami
 * @version 2.0.0
 * @updated 2025-05-27
 */

'use strict';

const yup = require('yup');
const { STATUTS_PROJET, STATUTS_LIVRABLE } = require('../../config/constants');

// Convertir les constantes STATUTS_PROJET en tableau pour Yup
const statutsProjetArray = Object.values(STATUTS_PROJET);
const statutsLivrableArray = Object.values(STATUTS_LIVRABLE);

/**
 * Schéma de base pour les projets
 */
const projetBaseSchema = {
    titre: yup.string()
        .min(5, 'Le titre doit contenir au moins 5 caractères.')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères.')
        .required('Le titre du projet est obligatoire.'),

    description: yup.string()
        .min(20, 'La description doit contenir au moins 20 caractères.')
        .required('La description du projet est obligatoire.'),

    equipe: yup.array()
        .of(yup.string().required('ID du membre requis'))
        .min(1, 'L\'équipe doit contenir au moins un membre.'),

    tuteur: yup.string()
        .required('Un tuteur est requis.'),

    competences: yup.array()
        .of(
            yup.string()
                .min(2, 'Une compétence doit contenir au moins 2 caractères.')
                .max(30, 'Une compétence ne peut pas dépasser 30 caractères.')
                .required()
        )
        .min(1, 'Le projet doit comporter au moins une compétence.'),

    dateDebut: yup.date()
        .required('La date de début est obligatoire.')
        .typeError('La date de début doit être une date valide.'),

    dateFin: yup.date()
        .required('La date de fin est obligatoire.')
        .typeError('La date de fin doit être une date valide.')
        .test(
            'is-after-start',
            'La date de fin doit être postérieure à la date de début',
            function(value) {
                const { dateDebut } = this.parent;
                return !dateDebut || !value || new Date(value) > new Date(dateDebut);
            }
        ),

    statut: yup.string()
        .oneOf(statutsProjetArray, `Le statut doit être l'un des suivants: ${statutsProjetArray.join(', ')}`)
};

/**
 * Schéma de validation pour un livrable
 */
const livrableSchema = yup.object().shape({
    nom: yup.string()
        .min(2, 'Le nom du livrable doit contenir au moins 2 caractères.')
        .max(100, 'Le nom du livrable ne peut pas dépasser 100 caractères.')
        .required('Le nom du livrable est requis.'),

    description: yup.string()
        .min(10, 'La description du livrable doit contenir au moins 10 caractères.')
        .required('La description du livrable est requise.'),

    dateLimite: yup.date()
        .required('La date limite est requise.')
        .typeError('La date limite doit être une date valide.')
        .test(
            'is-before-project-end',
            'La date limite ne peut pas être postérieure à la date de fin du projet',
            function(value) {
                // Accéder à la date de fin du projet parent si c'est une sous-validation
                const { dateFin } = this.options.context || {};
                return !dateFin || !value || new Date(value) <= new Date(dateFin);
            }
        ),

    statut: yup.string()
        .oneOf(
            statutsLivrableArray,
            `Statut du livrable invalide. Valeurs acceptées: ${statutsLivrableArray.join(', ')}`
        ),

    urlDepot: yup.string()
        .url('URL du dépôt invalide.')
        .notRequired() // Peut être vide initialement
        .nullable()
});

/**
 * Schéma complet pour la création d'un projet
 */
const projetCreationSchema = yup.object().shape({
    ...projetBaseSchema,
    livrables: yup.array().of(livrableSchema)
});

/**
 * Schéma pour la mise à jour d'un projet (champs optionnels)
 */
const projetMiseAJourSchema = yup.object().shape(
    Object.entries(projetBaseSchema).reduce((schema, [key, validator]) => {
        // Rendre tous les champs optionnels pour la mise à jour
        schema[key] = validator.notRequired();
        return schema;
    }, {})
);

/**
 * Middleware pour valider la création d'un projet avec Yup
 */
const validerCreationProjet = async (req, res, next) => {
    try {
        await projetCreationSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            context: {
                // Ajouter des informations contextuelles pour les tests
                user: req.user,
                operation: 'create'
            }
        });

        // Validation réussie, continuer
        next();
    } catch (error) {
        // Formater l'erreur Yup pour le gestionnaire d'erreurs
        const validationError = new Error('Validation du projet échouée');
        validationError.name = 'ValidationError';
        validationError.statusCode = 400;
        validationError.isOperational = true;

        // Transformer les erreurs Yup en format standard
        validationError.errors = error.inner.map(err => ({
            champ: err.path,
            message: err.message,
            type: err.type
        }));

        // Passer au gestionnaire d'erreurs
        next(validationError);
    }
};

/**
 * Middleware pour valider la mise à jour d'un projet avec Yup
 */
const validerMiseAJourProjet = async (req, res, next) => {
    try {
        await projetMiseAJourSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: false,
            context: {
                user: req.user,
                operation: 'update',
                projetId: req.params.id
            }
        });

        // Validation réussie, continuer
        next();
    } catch (error) {
        // Même logique de traitement d'erreur que pour la création
        const validationError = new Error('Validation de la mise à jour échouée');
        validationError.name = 'ValidationError';
        validationError.statusCode = 400;
        validationError.isOperational = true;
        validationError.errors = error.inner.map(err => ({
            champ: err.path,
            message: err.message,
            type: err.type
        }));

        next(validationError);
    }
};

/**
 * Validation d'un livrable individuel
 */
const validerLivrable = async (data, context = {}) => {
    try {
        return await livrableSchema.validate(data, {
            abortEarly: false,
            context
        });
    } catch (error) {
        // Transformer les erreurs Yup en format standard
        return {
            isValid: false,
            errors: error.inner.map(err => ({
                champ: err.path,
                message: err.message,
                type: err.type
            }))
        };
    }
};

module.exports = {
    // Schémas de validation
    schemas: {
        projetCreationSchema,
        projetMiseAJourSchema,
        livrableSchema
    },

    // Middlewares de validation
    middlewares: {
        validerCreationProjet,
        validerMiseAJourProjet
    },

    // Fonctions utilitaires
    utils: {
        validerLivrable
    }
};