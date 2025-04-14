// src/modules/project-management/schema.js
// Schéma de validation Joi avec messages personnalisés

export const graphqlCreateProjectSchema = Joi.object({
    titre: Joi.string().trim().min(3).required().messages({
        'string.base': 'Le titre doit être une chaîne de caractères.',
        'string.empty': 'Le titre est requis.',
        'string.min': 'Le titre doit contenir au moins 3 caractères.',
        'any.required': 'Le titre est requis.'
    }),
    description: Joi.string().min(50).required().messages({
        'string.base': 'La description doit être une chaîne de caractères.',
        'string.empty': 'La description est requise.',
        'string.min': 'La description doit contenir au moins 50 caractères.',
        'any.required': 'La description est requise.'
    }),
    equipe: Joi.array().items(Joi.string().hex().length(24)).min(1).required().messages({
        'array.base': 'L\'équipe doit être un tableau.',
        'array.min': 'L\'équipe doit contenir au moins un membre.',
        'any.required': 'L\'équipe est requise.'
    }),
    tuteur: Joi.string().hex().length(24).required().messages({
        'string.base': 'Le tuteur doit être un ID valide.',
        'string.empty': 'Le tuteur est requis.',
        'any.required': 'Le tuteur est requis.'
    }),
    skills: Joi.array().items(Joi.string()).min(1).required().messages({
        'array.base': 'Les compétences doivent être un tableau.',
        'array.min': 'Au moins une compétence est requise.',
        'any.required': 'Les compétences sont requises.'
    }),
    deliverables: Joi.array().items(
        Joi.object({
            name: Joi.string().required().messages({
                'string.base': 'Le nom du livrable doit être une chaîne de caractères.',
                'string.empty': 'Le nom du livrable est requis.',
                'any.required': 'Le nom du livrable est requis.'
            }),
            deadline: Joi.date().iso().required().messages({
                'date.base': 'La date limite doit être une date valide.',
                'any.required': 'La date limite est requise.'
            }),
            status: Joi.string().valid('en attente', 'terminé', 'en retard').optional().messages({
                'string.base': 'Le statut doit être une chaîne de caractères.',
                'any.only': 'Le statut doit être "en attente", "terminé" ou "en retard".'
            }),
            repositoryUrl: Joi.string()
                .uri()
                .pattern(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/)
                .required()
                .messages({
                    'string.base': 'L\'URL du dépôt doit être une chaîne de caractères.',
                    'string.pattern.base': 'L\'URL du dépôt doit être une URL GitHub valide.',
                    'any.required': 'L\'URL du dépôt est requise.'
                })
        })
    ).optional()
});