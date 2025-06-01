const yup = require('yup');
const mongoose = require('mongoose');
const { MessagesErreur, StatutHttp } = require('../../config/constants');

// Schéma de validation pour une question
const questionSchema = yup.object().shape({
    texte: yup.string()
        .required('Le texte de la question est requis.')
        .min(10, 'Le texte de la question doit contenir au moins 10 caractères.')
        .max(500, 'Le texte de la question ne peut pas dépasser 500 caractères.'),
    
    type: yup.string()
        .required('Le type de question est requis.')
        .oneOf(['QCM', 'VRAI_FAUX', 'TEXTE_LIBRE'], 'Type de question invalide.'),
    
    options: yup.array()
        .when('type', {
            is: 'QCM',
            then: yup.array()
                .of(yup.string()
                    .required('Chaque option doit être une chaîne de caractères.')
                    .min(1, 'Chaque option doit contenir au moins 1 caractère.')
                    .max(200, 'Chaque option ne peut pas dépasser 200 caractères.')
                )
                .min(2, 'Il doit y avoir au moins 2 options.')
                .max(6, 'Il ne peut pas y avoir plus de 6 options.')
                .required('Les options sont requises pour une question QCM.'),
            otherwise: yup.array().notRequired()
        }),
    
    reponseCorrecte: yup.mixed()
        .when('type', {
            is: 'QCM',
            then: yup.number()
                .required('L\'index de la réponse correcte est requis.')
                .min(0, 'L\'index de la réponse correcte doit être positif.')
                .test('valid-option', 'L\'index de la réponse correcte doit correspondre à une option existante.',
                    function(value) {
                        return value < this.parent.options.length;
                    })
        })
        .when('type', {
            is: 'VRAI_FAUX',
            then: yup.boolean()
                .required('La réponse correcte est requise pour une question vrai/faux.')
        })
        .when('type', {
            is: 'TEXTE_LIBRE',
            then: yup.string()
                .required('La réponse correcte est requise.')
                .min(1, 'La réponse correcte doit contenir au moins 1 caractère.')
                .max(200, 'La réponse correcte ne peut pas dépasser 200 caractères.')
        }),
    
    points: yup.number()
        .min(1, 'Le nombre de points doit être au moins 1.')
        .max(10, 'Le nombre de points ne peut pas dépasser 10.')
        .default(1),
    
    explication: yup.string()
        .max(500, 'L\'explication ne peut pas dépasser 500 caractères.')
});

// Schéma de validation pour la création d'un quiz
const creationQuizSchema = yup.object().shape({
    titre: yup.string()
        .required('Le titre du quiz est requis.')
        .min(5, 'Le titre doit contenir au moins 5 caractères.')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères.'),
    
    description: yup.string()
        .required('La description du quiz est requise.')
        .min(20, 'La description doit contenir au moins 20 caractères.')
        .max(1000, 'La description ne peut pas dépasser 1000 caractères.'),
    
    categorie: yup.string()
        .required('La catégorie du quiz est requise.')
        .oneOf(['PROGRAMMATION', 'BASE_DE_DONNEES', 'RESEAUX', 'SECURITE', 'DEVOPS', 'AUTRE'], 'Catégorie invalide.'),
    
    niveau: yup.string()
        .required('Le niveau du quiz est requis.')
        .oneOf(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT'], 'Niveau invalide.'),
    
    duree: yup.number()
        .required('La durée du quiz est requise.')
        .min(5, 'La durée doit être d\'au moins 5 minutes.')
        .max(180, 'La durée ne peut pas dépasser 180 minutes.'),
    
    questions: yup.array()
        .of(questionSchema)
        .min(1, 'Le quiz doit contenir au moins une question.')
        .max(50, 'Le quiz ne peut pas contenir plus de 50 questions.')
        .required('Les questions sont requises.'),
    
    auteur: yup.string()
        .required('L\'auteur du quiz est requis.')
        .test('is-mongodb-id', 'L\'ID de l\'auteur est invalide.', value => mongoose.Types.ObjectId.isValid(value)),
    
    estPublic: yup.boolean()
        .default(true),
    
    tags: yup.array()
        .of(yup.string()
            .min(2, 'Chaque tag doit contenir au moins 2 caractères.')
            .max(20, 'Chaque tag ne peut pas dépasser 20 caractères.')
        )
        .max(10, 'Le quiz ne peut pas avoir plus de 10 tags.')
});

// Schéma de validation pour la mise à jour d'un quiz
const miseAJourQuizSchema = yup.object().shape({
    titre: yup.string()
        .min(5, 'Le titre doit contenir au moins 5 caractères.')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères.'),
    
    description: yup.string()
        .min(20, 'La description doit contenir au moins 20 caractères.')
        .max(1000, 'La description ne peut pas dépasser 1000 caractères.'),
    
    categorie: yup.string()
        .oneOf(['PROGRAMMATION', 'BASE_DE_DONNEES', 'RESEAUX', 'SECURITE', 'DEVOPS', 'AUTRE'], 'Catégorie invalide.'),
    
    niveau: yup.string()
        .oneOf(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT'], 'Niveau invalide.'),
    
    duree: yup.number()
        .min(5, 'La durée doit être d\'au moins 5 minutes.')
        .max(180, 'La durée ne peut pas dépasser 180 minutes.'),
    
    questions: yup.array()
        .of(questionSchema)
        .min(1, 'Le quiz doit contenir au moins une question.')
        .max(50, 'Le quiz ne peut pas contenir plus de 50 questions.'),
    
    estPublic: yup.boolean(),
    
    tags: yup.array()
        .of(yup.string()
            .min(2, 'Chaque tag doit contenir au moins 2 caractères.')
            .max(20, 'Chaque tag ne peut pas dépasser 20 caractères.')
        )
        .max(10, 'Le quiz ne peut pas avoir plus de 10 tags.')
});

// Schéma de validation pour la soumission des réponses
const soumissionReponsesSchema = yup.object().shape({
    quizId: yup.string()
        .required('L\'ID du quiz est requis.')
        .test('is-mongodb-id', 'L\'ID du quiz est invalide.', value => mongoose.Types.ObjectId.isValid(value)),
    
    utilisateurId: yup.string()
        .required('L\'ID de l\'utilisateur est requis.')
        .test('is-mongodb-id', 'L\'ID de l\'utilisateur est invalide.', value => mongoose.Types.ObjectId.isValid(value)),
    
    reponses: yup.array()
        .of(yup.mixed()
            .required('Chaque réponse est requise.')
        )
        .required('Les réponses sont requises.')
});

/**
 * Valide les données de création d'un quiz
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateCreationQuizData(data) {
    try {
        return await creationQuizSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });
    } catch (error) {
        throw {
            status: StatutHttp.BAD_REQUEST,
            message: MessagesErreur.VALIDATION_ECHEC,
            details: error.errors
        };
    }
}

/**
 * Valide les données de mise à jour d'un quiz
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateMiseAJourQuizData(data) {
    try {
        return await miseAJourQuizSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });
    } catch (error) {
        throw {
            status: StatutHttp.BAD_REQUEST,
            message: MessagesErreur.VALIDATION_ECHEC,
            details: error.errors
        };
    }
}

/**
 * Valide les données de soumission des réponses
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateSoumissionReponsesData(data) {
    try {
        return await soumissionReponsesSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });
    } catch (error) {
        throw {
            status: StatutHttp.BAD_REQUEST,
            message: MessagesErreur.VALIDATION_ECHEC,
            details: error.errors
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
            message: MessagesErreur.ID_INVALIDE
        };
    }
    return true;
}

module.exports = {
    validateCreationQuizData,
    validateMiseAJourQuizData,
    validateSoumissionReponsesData,
    validateId,
    creationQuizSchema,
    miseAJourQuizSchema,
    soumissionReponsesSchema,
    questionSchema
}; 