const yup = require('yup');
const mongoose = require('mongoose');
const { MessagesErreur, StatutHttp } = require('../../config/constants');

// Schéma de validation pour une ressource
const ressourceSchema = yup.object().shape({
    titre: yup
        .string()
        .required('Le titre de la ressource est requis.')
        .min(5, 'Le titre doit contenir au moins 5 caractères.')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères.'),

    type: yup
        .string()
        .required('Le type de ressource est requis.')
        .oneOf(['VIDEO', 'DOCUMENT', 'LIEN', 'CODE'], 'Type de ressource invalide.'),

    url: yup.string().required('L\'URL de la ressource est requise.').url('L\'URL doit être valide.'),

    description: yup.string().max(500, 'La description ne peut pas dépasser 500 caractères.'),

    duree: yup
        .number()
        .min(0, 'La durée doit être positive.')
        .when('type', {
            is: 'VIDEO',
            then: yup.number().required('La durée est requise pour une vidéo.'),
        }),
});

// Schéma de validation pour un module
const moduleSchema = yup.object().shape({
    titre: yup
        .string()
        .required('Le titre du module est requis.')
        .min(5, 'Le titre doit contenir au moins 5 caractères.')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères.'),

    description: yup
        .string()
        .required('La description du module est requise.')
        .min(20, 'La description doit contenir au moins 20 caractères.')
        .max(1000, 'La description ne peut pas dépasser 1000 caractères.'),

    ordre: yup
        .number()
        .required('L\'ordre du module est requis.')
        .min(1, 'L\'ordre doit être au moins 1.'),

    duree: yup
        .number()
        .required('La durée du module est requise.')
        .min(5, 'La durée doit être d\'au moins 5 minutes.')
        .max(480, 'La durée ne peut pas dépasser 480 minutes.'),

    quiz: yup.array().of(
        yup
            .string()
            .required('L\'ID du quiz est requis.')
            .test('is-mongodb-id', 'L\'ID du quiz est invalide.', value =>
                mongoose.Types.ObjectId.isValid(value)
            )
    ),

    ressources: yup
        .array()
        .of(ressourceSchema)
        .min(1, 'Le module doit contenir au moins une ressource.'),
});

// Schéma de validation pour la création d'une formation
const creationFormationSchema = yup.object().shape({
    titre: yup
        .string()
        .required('Le titre de la formation est requis.')
        .min(5, 'Le titre doit contenir au moins 5 caractères.')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères.'),

    description: yup
        .string()
        .required('La description de la formation est requise.')
        .min(20, 'La description doit contenir au moins 20 caractères.')
        .max(2000, 'La description ne peut pas dépasser 2000 caractères.'),

    categorie: yup
        .string()
        .required('La catégorie de la formation est requise.')
        .oneOf(
            ['PROGRAMMATION', 'BASE_DE_DONNEES', 'RESEAUX', 'SECURITE', 'DEVOPS', 'AUTRE'],
            'Catégorie invalide.'
        ),

    niveau: yup
        .string()
        .required('Le niveau de la formation est requis.')
        .oneOf(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT'], 'Niveau invalide.'),

    duree: yup
        .number()
        .required('La durée de la formation est requise.')
        .min(30, 'La durée doit être d\'au moins 30 minutes.')
        .max(4800, 'La durée ne peut pas dépasser 4800 minutes.'),

    prerequis: yup
        .array()
        .of(
            yup
                .string()
                .min(5, 'Chaque prérequis doit contenir au moins 5 caractères.')
                .max(100, 'Chaque prérequis ne peut pas dépasser 100 caractères.')
        ),

    objectifs: yup
        .array()
        .of(
            yup
                .string()
                .min(10, 'Chaque objectif doit contenir au moins 10 caractères.')
                .max(200, 'Chaque objectif ne peut pas dépasser 200 caractères.')
        )
        .min(1, 'La formation doit avoir au moins un objectif.')
        .max(10, 'La formation ne peut pas avoir plus de 10 objectifs.'),

    modules: yup
        .array()
        .of(moduleSchema)
        .min(1, 'La formation doit contenir au moins un module.')
        .max(20, 'La formation ne peut pas contenir plus de 20 modules.'),

    auteur: yup
        .string()
        .required('L\'auteur de la formation est requis.')
        .test('is-mongodb-id', 'L\'ID de l\'auteur est invalide.', value =>
            mongoose.Types.ObjectId.isValid(value)
        ),

    prix: yup.number().min(0, 'Le prix doit être positif ou nul.'),

    estPublique: yup.boolean().default(true),

    tags: yup
        .array()
        .of(
            yup
                .string()
                .min(2, 'Chaque tag doit contenir au moins 2 caractères.')
                .max(20, 'Chaque tag ne peut pas dépasser 20 caractères.')
        )
        .max(10, 'La formation ne peut pas avoir plus de 10 tags.'),
});

// Schéma de validation pour la mise à jour d'une formation
const miseAJourFormationSchema = yup.object().shape({
    titre: yup
        .string()
        .min(5, 'Le titre doit contenir au moins 5 caractères.')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères.'),

    description: yup
        .string()
        .min(20, 'La description doit contenir au moins 20 caractères.')
        .max(2000, 'La description ne peut pas dépasser 2000 caractères.'),

    categorie: yup
        .string()
        .oneOf(
            ['PROGRAMMATION', 'BASE_DE_DONNEES', 'RESEAUX', 'SECURITE', 'DEVOPS', 'AUTRE'],
            'Catégorie invalide.'
        ),

    niveau: yup
        .string()
        .oneOf(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT'], 'Niveau invalide.'),

    duree: yup
        .number()
        .min(30, 'La durée doit être d\'au moins 30 minutes.')
        .max(4800, 'La durée ne peut pas dépasser 4800 minutes.'),

    prerequis: yup
        .array()
        .of(
            yup
                .string()
                .min(5, 'Chaque prérequis doit contenir au moins 5 caractères.')
                .max(100, 'Chaque prérequis ne peut pas dépasser 100 caractères.')
        ),

    objectifs: yup
        .array()
        .of(
            yup
                .string()
                .min(10, 'Chaque objectif doit contenir au moins 10 caractères.')
                .max(200, 'Chaque objectif ne peut pas dépasser 200 caractères.')
        )
        .max(10, 'La formation ne peut pas avoir plus de 10 objectifs.'),

    modules: yup
        .array()
        .of(moduleSchema)
        .max(20, 'La formation ne peut pas contenir plus de 20 modules.'),

    prix: yup.number().min(0, 'Le prix doit être positif ou nul.'),

    estPublique: yup.boolean(),

    tags: yup
        .array()
        .of(
            yup
                .string()
                .min(2, 'Chaque tag doit contenir au moins 2 caractères.')
                .max(20, 'Chaque tag ne peut pas dépasser 20 caractères.')
        )
        .max(10, 'La formation ne peut pas avoir plus de 10 tags.'),
});

// Schéma de validation pour l'ajout d'une note
const noteSchema = yup.object().shape({
    valeur: yup
        .number()
        .required('La note est requise.')
        .min(1, 'La note doit être au moins 1.')
        .max(5, 'La note ne peut pas dépasser 5.'),

    commentaire: yup.string().max(500, 'Le commentaire ne peut pas dépasser 500 caractères.'),
});

// Schéma de validation pour la mise à jour de la progression
const progressionSchema = yup.object().shape({
    modulesCompletes: yup.array().of(
        yup
            .string()
            .required('L\'ID du module est requis.')
            .test('is-mongodb-id', 'L\'ID du module est invalide.', value =>
                mongoose.Types.ObjectId.isValid(value)
            )
    ),

    quizCompletes: yup.array().of(
        yup
            .string()
            .required('L\'ID du quiz est requis.')
            .test('is-mongodb-id', 'L\'ID du quiz est invalide.', value =>
                mongoose.Types.ObjectId.isValid(value)
            )
    ),

    ressourcesConsultees: yup.array().of(
        yup
            .string()
            .required('L\'ID de la ressource est requis.')
            .test('is-mongodb-id', 'L\'ID de la ressource est invalide.', value =>
                mongoose.Types.ObjectId.isValid(value)
            )
    ),
});

/**
 * Valide les données de création d'une formation
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateCreationFormationData(data) {
    try {
        return await creationFormationSchema.validate(data, {
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
 * Valide les données de mise à jour d'une formation
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateMiseAJourFormationData(data) {
    try {
        return await miseAJourFormationSchema.validate(data, {
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
 * Valide les données d'une note
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateNoteData(data) {
    try {
        return await noteSchema.validate(data, {
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
 * Valide les données de progression
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateProgressionData(data) {
    try {
        return await progressionSchema.validate(data, {
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
    validateCreationFormationData,
    validateMiseAJourFormationData,
    validateNoteData,
    validateProgressionData,
    validateId,
    creationFormationSchema,
    miseAJourFormationSchema,
    noteSchema,
    progressionSchema,
    moduleSchema,
    ressourceSchema,
};
