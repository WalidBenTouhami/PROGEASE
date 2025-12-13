const yup = require('yup');
const mongoose = require('mongoose');
const { MessagesErreur, StatutHttp } = require('../../config/constants');

// Schéma de validation pour les réponses
const reponseSchema = yup.object().shape({
    contenu: yup
        .string()
        .required('Le contenu de la réponse est requis.')
        .min(10, 'Le contenu doit contenir au moins 10 caractères.')
        .max(2000, 'Le contenu ne peut pas dépasser 2000 caractères.'),
});

// Schéma de validation pour les sujets
const sujetSchema = yup.object().shape({
    titre: yup
        .string()
        .required('Le titre du sujet est requis.')
        .min(5, 'Le titre doit contenir au moins 5 caractères.')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères.'),

    contenu: yup
        .string()
        .required('Le contenu du sujet est requis.')
        .min(20, 'Le contenu doit contenir au moins 20 caractères.')
        .max(5000, 'Le contenu ne peut pas dépasser 5000 caractères.'),

    categorie: yup
        .string()
        .required('La catégorie est requise.')
        .oneOf(
            ['GENERAL', 'TECHNIQUE', 'PROJET', 'FORMATION', 'AIDE', 'AUTRE'],
            'Catégorie invalide.'
        ),

    tags: yup
        .array()
        .of(
            yup
                .string()
                .min(2, 'Un tag doit contenir au moins 2 caractères.')
                .max(20, 'Un tag ne peut pas dépasser 20 caractères.')
        )
        .max(5, 'Un sujet ne peut pas avoir plus de 5 tags.'),

    auteur: yup
        .string()
        .required('L\'auteur est requis.')
        .test('is-mongo-id', 'ID auteur invalide.', val => mongoose.Types.ObjectId.isValid(val)),
});

// Schéma de validation pour le vote
const voteSchema = yup.object().shape({
    type: yup
        .string()
        .required('Le type de vote est requis.')
        .oneOf(['positif', 'negatif'], 'Type de vote invalide.'),
});

/**
 * Valide les données d'un sujet
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateSujetData(data) {
    try {
        return await sujetSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
        });
    } catch (error) {
        throw {
            status: StatutHttp.BAD_REQUEST,
            message: MessagesErreur.VALIDATION_ECHEC,
            details: error.errors,
        };
    }
}

/**
 * Valide les données d'une réponse
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateReponseData(data) {
    try {
        return await reponseSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
        });
    } catch (error) {
        throw {
            status: StatutHttp.BAD_REQUEST,
            message: MessagesErreur.VALIDATION_ECHEC,
            details: error.errors,
        };
    }
}

/**
 * Valide les données d'un vote
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateVoteData(data) {
    try {
        return await voteSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
        });
    } catch (error) {
        throw {
            status: StatutHttp.BAD_REQUEST,
            message: MessagesErreur.VALIDATION_ECHEC,
            details: error.errors,
        };
    }
}

/**
 * Valide un ID MongoDB
 * @param {string} id - ID à valider
 * @returns {boolean} - True si l'ID est valide
 */
function validateId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw {
            status: StatutHttp.BAD_REQUEST,
            message: MessagesErreur.ID_INVALIDE,
        };
    }
    return true;
}

module.exports = {
    validateSujetData,
    validateReponseData,
    validateVoteData,
    validateId,
    sujetSchema,
    reponseSchema,
    voteSchema,
};
