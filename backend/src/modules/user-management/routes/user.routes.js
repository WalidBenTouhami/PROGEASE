// src/modules/user-management/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const userMiddleware = require('../middlewares/user.middleware'); // Ajout manquant
const {
    verifyToken,
    checkRoles,
    validateRequest,
    sanitizeInput
} = require('../middlewares/user.middleware');
const {
    HTTP_STATUS,
    SECURITY,
    API
} = require('../../../config/constants');
const userValidation = require('../validations/user.validation');

// Middleware de versioning API
router.use(`/api/${API.CURRENT_VERSION}/users`, router);

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
    userMiddleware.attachUser, // Déplacé ici
    userController.getUserById
);

// 🔄 Mise à jour utilisateur (propriétaire ou admin)
router.put(
    '/:id',
    sanitizeInput,
    validateRequest(userValidation.updateUserSchema),
    userMiddleware.checkOwnership(),
    userMiddleware.preventRoleEscalation,
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