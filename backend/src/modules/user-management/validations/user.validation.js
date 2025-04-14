// src/modules/user-management/validations/user.validation.js
const Joi = require('joi');

const createUserSchema = Joi.object({
    userId: Joi.string().optional(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('admin', 'user', 'moderator').optional()
});

const updateUserSchema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).optional(),
    role: Joi.string().valid('admin', 'user', 'moderator').optional()
});

const userIdSchema = Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

module.exports = {
    createUserSchema,
    updateUserSchema,
    userIdSchema
};