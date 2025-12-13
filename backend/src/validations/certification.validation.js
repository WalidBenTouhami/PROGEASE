const Joi = require('joi');
const { Enums } = require('../config/constants');

// Schéma de validation pour la création d'une certification
const createCertificationSchema = Joi.object({
    titre: Joi.string().required().min(5).max(100).messages({
        'string.empty': 'Le titre est requis',
        'string.min': 'Le titre doit contenir au moins 5 caractères',
        'string.max': 'Le titre ne peut pas dépasser 100 caractères',
    }),

    description: Joi.string().required().min(20).messages({
        'string.empty': 'La description est requise',
        'string.min': 'La description doit contenir au moins 20 caractères',
    }),

    niveau: Joi.string()
        .required()
        .valid(...Object.values(Enums.NiveauFormation))
        .messages({
            'any.only': 'Niveau de certification invalide',
        }),

    image: Joi.string().default('default-certification.jpg'),

    conditions: Joi.object({
        formationsRequises: Joi.array().items(
            Joi.object({
                formation: Joi.string()
                    .required()
                    .regex(/^[0-9a-fA-F]{24}$/)
                    .messages({
                        'string.pattern.base': 'ID de formation invalide',
                    }),
                noteMinimale: Joi.number().required().min(0).max(100).messages({
                    'number.min': 'La note minimale ne peut pas être négative',
                    'number.max': 'La note maximale ne peut pas dépasser 100',
                }),
            })
        ),
        quizFinal: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .allow(null),
        noteMinimaleQuizFinal: Joi.number().min(0).max(100).messages({
            'number.min': 'La note minimale ne peut pas être négative',
            'number.max': 'La note maximale ne peut pas dépasser 100',
        }),
        projetFinal: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .allow(null),
    }),

    competencesValidees: Joi.array().items(Joi.string().trim()),

    dureeValidite: Joi.number().required().min(1).messages({
        'number.min': 'La durée de validité doit être supérieure à 0',
    }),

    prix: Joi.object({
        montant: Joi.number().required().min(0).messages({
            'number.min': 'Le prix ne peut pas être négatif',
        }),
        devise: Joi.string().required().valid('EUR', 'USD', 'GBP'),
    }),

    estActif: Joi.boolean().default(true),
});

// Schéma de validation pour la mise à jour d'une certification
const updateCertificationSchema = createCertificationSchema.fork(
    ['titre', 'description', 'niveau', 'dureeValidite', 'prix.montant', 'prix.devise'],
    schema => schema.optional()
);

// Schéma de validation pour l'obtention d'une certification
const certificationObtenuSchema = Joi.object({
    certification: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'ID de certification invalide',
        }),

    utilisateur: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'ID d\'utilisateur invalide',
        }),

    statut: Joi.string()
        .required()
        .valid(...Object.values(Enums.StatutCertification))
        .messages({
            'any.only': 'Statut de certification invalide',
        }),

    dateObtention: Joi.date().allow(null),

    dateExpiration: Joi.date().allow(null),

    formationsTerminees: Joi.array().items(
        Joi.object({
            formation: Joi.string()
                .regex(/^[0-9a-fA-F]{24}$/)
                .messages({
                    'string.pattern.base': 'ID de formation invalide',
                }),
            dateCompletion: Joi.date().required(),
            note: Joi.number().required().min(0).max(100),
        })
    ),

    quizFinalResultat: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .allow(null),

    projetFinalResultat: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .allow(null),
});

module.exports = {
    createCertificationSchema,
    updateCertificationSchema,
    certificationObtenuSchema,
};
