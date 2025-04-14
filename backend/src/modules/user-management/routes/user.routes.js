// src/modules/user-management/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const {
    verifyToken,
    checkRoles,
    validateRequest,
    sanitizeInput,
    attachUser,
    checkOwnership,
    preventRoleEscalation
} = require('../middlewares/user.middleware');
const { SECURITY, API } = require('../../../config/constants');
const userValidation = require('../validations/user.validation');

// ✅ Création utilisateur (public avec limite de taux)
router.post(
    '/',
    sanitizeInput,
    validateRequest(userValidation.createUserSchema),
    userController.createUser
);

// 🔒 Routes protégées
router.use(verifyToken);

// 🔍 Liste utilisateurs (admin only)
router.get(
    '/',
    checkRoles([SECURITY.ROLES.ADMIN]),
    sanitizeInput,
    userController.getAllUsers
);

// 🔎 Détails utilisateur
router.get(
    '/:id',
    sanitizeInput,
    validateRequest(userValidation.userIdSchema),
    attachUser,
    userController.getUserById
);

// 🔄 Mise à jour utilisateur (propriétaire ou admin)
router.put(
    '/:id',
    sanitizeInput,
    validateRequest(userValidation.updateUserSchema),
    checkOwnership(),
    preventRoleEscalation,
    userController.updateUser
);

// ❌ Suppression utilisateur (admin only)
router.delete(
    '/:id',
    checkRoles([SECURITY.ROLES.ADMIN]),
    sanitizeInput,
    validateRequest(userValidation.userIdSchema),
    userController.deleteUser
);

module.exports = router;