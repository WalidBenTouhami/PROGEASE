const mongoose = require('mongoose');
const { body } = require('express-validator');
const yup = require('yup');
const { MessagesErreur, StatutHttp, Enums } = require('../../config/constants');
const Joi = require('joi');

// Validation de l'ID utilisateur
function validateId(paramName, source = 'params') {
    return (req, res, next) => {
        const id = source === 'params' ? req.params[paramName] : req.body[paramName];

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID invalide',
                error: `L'ID '${paramName}' est invalide ou manquant.`
            });
        }
        next();
    };
}

// Validation des données utilisateur
const validateUtilisateurData = [
    body('nom')
        .trim()
        .notEmpty().withMessage('Le nom est requis')
        .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères')
        .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères'),

    body('email')
        .trim()
        .notEmpty().withMessage('L\'email est requis')
        .isEmail().withMessage('Format d\'email invalide')
        .normalizeEmail(),

    body('role')
        .optional()
        .isIn(Object.values(Enums.UtilisateurRole)).withMessage(MessagesErreur.GENERAL.NON_AUTORISE),

    body('projets')
        .optional()
        .isArray().withMessage('Les projets doivent être un tableau')
        .custom((value) => {
            if (!value.every(id => mongoose.Types.ObjectId.isValid(id))) {
                throw new Error('Un ou plusieurs IDs de projet sont invalides');
            }
            return true;
        })
];

// Schéma de validation pour l'inscription
const inscriptionSchema = yup.object().shape({
    nom: yup.string()
        .required('Le nom est requis.')
        .min(2, 'Le nom doit contenir au moins 2 caractères.')
        .max(50, 'Le nom ne peut pas dépasser 50 caractères.'),
    
    prenom: yup.string()
        .required('Le prénom est requis.')
        .min(2, 'Le prénom doit contenir au moins 2 caractères.')
        .max(50, 'Le prénom ne peut pas dépasser 50 caractères.'),
    
    email: yup.string()
        .required('L\'email est requis.')
        .email('Format d\'email invalide.')
        .max(100, 'L\'email ne peut pas dépasser 100 caractères.'),
    
    motDePasse: yup.string()
        .required('Le mot de passe est requis.')
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
        .max(50, 'Le mot de passe ne peut pas dépasser 50 caractères.')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.'
        ),
    
    confirmationMotDePasse: yup.string()
        .required('La confirmation du mot de passe est requise.')
        .oneOf([yup.ref('motDePasse')], 'Les mots de passe ne correspondent pas.'),
    
    telephone: yup.string()
        .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Format de téléphone invalide.'),
    
    dateNaissance: yup.date()
        .max(new Date(), 'La date de naissance ne peut pas être dans le futur.')
        .min(new Date(1900, 0, 1), 'Date de naissance invalide.')
        .required('La date de naissance est requise.'),
    
    roles: yup.array()
        .of(yup.string().oneOf(['ETUDIANT', 'ENSEIGNANT', 'ADMIN', 'MODERATEUR']))
        .min(1, 'Au moins un rôle est requis.')
});

// Schéma de validation pour la connexion
const connexionSchema = yup.object().shape({
    email: yup.string()
        .required('L\'email est requis.')
        .email('Format d\'email invalide.'),
    
    motDePasse: yup.string()
        .required('Le mot de passe est requis.')
});

// Schéma de validation pour la mise à jour du profil
const miseAJourProfilSchema = yup.object().shape({
    nom: yup.string()
        .min(2, 'Le nom doit contenir au moins 2 caractères.')
        .max(50, 'Le nom ne peut pas dépasser 50 caractères.'),
    
    prenom: yup.string()
        .min(2, 'Le prénom doit contenir au moins 2 caractères.')
        .max(50, 'Le prénom ne peut pas dépasser 50 caractères.'),
    
    email: yup.string()
        .email('Format d\'email invalide.')
        .max(100, 'L\'email ne peut pas dépasser 100 caractères.'),
    
    telephone: yup.string()
        .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Format de téléphone invalide.'),
    
    dateNaissance: yup.date()
        .max(new Date(), 'La date de naissance ne peut pas être dans le futur.')
        .min(new Date(1900, 0, 1), 'Date de naissance invalide.'),
    
    avatar: yup.string()
        .url('L\'URL de l\'avatar doit être valide.'),
    
    bio: yup.string()
        .max(500, 'La bio ne peut pas dépasser 500 caractères.')
});

// Schéma de validation pour le changement de mot de passe
const changementMotDePasseSchema = yup.object().shape({
    ancienMotDePasse: yup.string()
        .required('L\'ancien mot de passe est requis.'),
    
    nouveauMotDePasse: yup.string()
        .required('Le nouveau mot de passe est requis.')
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
        .max(50, 'Le mot de passe ne peut pas dépasser 50 caractères.')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.'
        )
        .notOneOf([yup.ref('ancienMotDePasse')], 'Le nouveau mot de passe doit être différent de l\'ancien.'),
    
    confirmationMotDePasse: yup.string()
        .required('La confirmation du mot de passe est requise.')
        .oneOf([yup.ref('nouveauMotDePasse')], 'Les mots de passe ne correspondent pas.')
});

/**
 * Valide les données d'inscription
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateInscriptionData(data) {
    try {
        return await inscriptionSchema.validate(data, {
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
 * Valide les données de connexion
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateConnexionData(data) {
    try {
        return await connexionSchema.validate(data, {
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
 * Valide les données de mise à jour du profil
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateMiseAJourProfilData(data) {
    try {
        return await miseAJourProfilSchema.validate(data, {
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
 * Valide les données de changement de mot de passe
 * @param {Object} data - Données à valider
 * @returns {Promise<Object>} - Données validées
 */
async function validateChangementMotDePasseData(data) {
    try {
        return await changementMotDePasseSchema.validate(data, {
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

const validerUtilisateur = {
    creer: validateUtilisateurData,
    mettreAJour: validateUtilisateurData,
    connexion: [
        body('email')
            .trim()
            .notEmpty().withMessage('L\'email est requis')
            .isEmail().withMessage('Format d\'email invalide')
            .normalizeEmail(),
        body('motDePasse')
            .notEmpty().withMessage('Le mot de passe est requis')
    ]
};

module.exports = {
    validateId,
    validateUtilisateurData,
    validateInscriptionData,
    validateConnexionData,
    validateMiseAJourProfilData,
    validateChangementMotDePasseData,
    validerUtilisateur
};