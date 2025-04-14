// src/utils/validation.util.js

import Joi from 'joi';
import { RoleEnum } from '../config/constants.js';

export const projectValidationSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(50).max(2000).required(),
    team: Joi.array().items(Joi.string().hex().length(24)).min(1),
    deliverables: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            deadline: Joi.date().iso().min('now').required()
        })
    )
});

export const userValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string().valid(...Object.values(RoleEnum)).required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
});

export const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: error.details.map(d => d.message)
        });
    }
    next();
};