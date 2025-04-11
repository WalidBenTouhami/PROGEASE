// src/modules/project-management/schema.js

const Joi = require('joi');

exports.graphqlCreateProjectSchema = Joi.object({
    titre: Joi.string().trim().min(3).required(),
    description: Joi.string().min(50).required(),
    equipe: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    tuteur: Joi.string().hex().length(24).required(),
    skills: Joi.array().items(Joi.string()).min(1).required(),
    deliverables: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            deadline: Joi.date().iso().required(),
            status: Joi.string().valid('en attente', 'terminé', 'en retard').optional(),
            repositoryUrl: Joi.string()
                .uri()
                .pattern(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/)
                .required()
        })
    ).optional()
});
