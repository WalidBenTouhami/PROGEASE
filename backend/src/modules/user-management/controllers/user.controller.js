// src/modules/user-management/controllers/user.controller.js


import { createLogger } from '../../../utils/logger.js';

const logger = createLogger('UserController');

export const getUser = (req, res) => {
    const userId = req.params.id;
    logger.info(`Requête pour l'utilisateur avec l'ID: ${userId}`);
    // Logique pour gérer la requête
};

const User = require('../models/user.model');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../../config/constants');

// 🔐 Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
    try {
        const { userId, name, email, password, role } = req.body;

        // Vérifier l'existence de l'utilisateur
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: ERROR_MESSAGES.USER.EMAIL_EXISTS
            });
        }

        // Création de l'utilisateur
        const newUser = new User({ userId, name, email, password, role });
        await newUser.save();

        // Formater la réponse sans données sensibles
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(HTTP_STATUS.CREATED).json(userResponse);

    } catch (error) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: error.message.includes('validation failed')
                ? ERROR_MESSAGES.VALIDATION.INVALID_DATA
                : error.message
        });
    }
};

// 🔍 Récupérer tous les utilisateurs (avec pagination)
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            select: '-password -__v',
            collation: { locale: 'fr' }
        };

        const result = await User.paginate({}, options);

        res.status(HTTP_STATUS.OK).json({
            data: result.docs,
            total: result.totalDocs,
            page: result.page,
            totalPages: result.totalPages
        });

    } catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            message: ERROR_MESSAGES.DB_CONNECTION
        });
    }
};

// 🔎 Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -failedAttempts -__v');

        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: ERROR_MESSAGES.USER.NOT_FOUND
            });
        }

        res.status(HTTP_STATUS.OK).json(user);
    } catch (error) {
        handleMongooseError(res, error);
    }
};

// 🔄 Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
    try {
        const { email, ...updateData } = req.body;

        // Vérifier la disponibilité du nouvel email
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser.id !== req.params.id) {
                return res.status(HTTP_STATUS.CONFLICT).json({
                    message: ERROR_MESSAGES.USER.EMAIL_EXISTS
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { ...updateData, email },
            { new: true, runValidators: true }
        ).select('-password -__v');

        if (!updatedUser) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: ERROR_MESSAGES.USER.NOT_FOUND
            });
        }

        res.status(HTTP_STATUS.OK).json(updatedUser);
    } catch (error) {
        handleMongooseError(res, error);
    }
};

// ❌ Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: ERROR_MESSAGES.USER.NOT_FOUND
            });
        }

        res.status(HTTP_STATUS.OK).json({
            message: ERROR_MESSAGES.USER.DELETED
        });
    } catch (error) {
        handleMongooseError(res, error);
    }
};

// 🛡️ Gestion centralisée des erreurs Mongoose
function handleMongooseError(res, error) {
    console.error(error);

    const response = {
        message: ERROR_MESSAGES.DB_CONNECTION
    };

    if (error.name === 'CastError') {
        response.message = ERROR_MESSAGES.VALIDATION.INVALID_ID;
        res.status(HTTP_STATUS.BAD_REQUEST);
    } else if (error.name === 'ValidationError') {
        response.message = ERROR_MESSAGES.VALIDATION.FAILED;
        response.errors = Object.values(error.errors).map(err => err.message);
        res.status(HTTP_STATUS.BAD_REQUEST);
    } else {
        res.status(HTTP_STATUS.INTERNAL_ERROR);
    }

    res.json(response);
}