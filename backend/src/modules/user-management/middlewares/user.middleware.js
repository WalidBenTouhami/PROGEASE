// src/modules/user-management/middlewares/user.middleware.js

const { HTTP_STATUS, ERROR_MESSAGES, SECURITY } = require('../../../config/constants');
const User = require('../models/user.model');

// 🛡️ Vérifier la propriété de la ressource
exports.checkOwnership = (allowAdmin = true) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Admin bypass
            if (allowAdmin && userRole === SECURITY.ROLES.ADMIN) return next();

            // Vérifier la correspondance des IDs
            if (resourceId !== userId) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    message: ERROR_MESSAGES.USER.UNAUTHORIZED_OPERATION
                });
            }

            next();
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                message: ERROR_MESSAGES.DB_CONNECTION
            });
        }
    };
};

// 🔐 Vérifier l'état du compte
exports.checkAccountStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('status failedAttempts');

        if (user.status === APP.STATUSES.LOCKED) {
            const lockDuration = SECURITY.PASSWORD.lockDuration;
            const timeSinceLock = Date.now() - user.updatedAt;

            if (timeSinceLock < lockDuration) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    message: ERROR_MESSAGES.USER.ACCOUNT_LOCKED,
                    retryAfter: Math.ceil((lockDuration - timeSinceLock) / 1000)
                });
            }

            // Déverrouillage automatique
            user.status = APP.STATUSES.ACTIVE;
            user.failedAttempts = 0;
            await user.save();
        }

        next();
    } catch (error) {
        next(error);
    }
};

// 🛑 Empêcher l'auto-promotion de rôle
exports.preventRoleEscalation = (req, res, next) => {
    if (req.body.role && req.user.role !== SECURITY.ROLES.ADMIN) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            message: ERROR_MESSAGES.USER.ROLE_CHANGE_DENIED
        });
    }
    next();
};

// 📦 Attacher l'utilisateur à la requête
exports.attachUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -__v -failedAttempts');

        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: ERROR_MESSAGES.USER.NOT_FOUND
            });
        }

        req.requestedUser = user;
        next();
    } catch (error) {
        next(error);
    }
};