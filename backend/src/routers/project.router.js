const express = require('express');
const { check, param } = require('express-validator');
const projectController = require('../controllers/project.controller');
const validateRequest = require('../middlewares/validate.Request'); // Middleware personnalisé pour gérer les erreurs de validation

const router = express.Router();

// ✅ Routes pour les projets
router.post(
    '/',
    [
        check('titre').notEmpty().withMessage('Le titre est requis.'),
        check('description').notEmpty().withMessage('La description est requise.'),
        check('startDate').isISO8601().withMessage('StartDate doit être une date valide.'),
        check('endDate').isISO8601().withMessage('EndDate doit être une date valide.'),
    ],
    validateRequest,
    projectController.createProject
);

router.get('/', projectController.getProjects);

router.get(
    '/:id',
    [
        param('id').isMongoId().withMessage('ID invalide.'),
    ],
    validateRequest,
    projectController.getProjectById
);

router.put(
    '/:id',
    [
        param('id').isMongoId().withMessage('ID invalide.'),
        check('titre').optional().notEmpty().withMessage('Le titre ne peut pas être vide.'),
        check('description').optional().notEmpty().withMessage('La description ne peut pas être vide.'),
    ],
    validateRequest,
    projectController.updateProject
);

router.delete(
    '/:id',
    [
        param('id').isMongoId().withMessage('ID invalide.'),
    ],
    validateRequest,
    projectController.deleteProject
);

// ✅ Routes pour les livrables
router.post(
    '/:id/deliverables',
    [
        param('id').isMongoId().withMessage('ID de projet invalide.'),
        check('name').notEmpty().withMessage('Le nom du livrable est requis.'),
        check('deadline').isISO8601().withMessage('La deadline doit être une date valide.'),
        check('repositoryUrl').isURL().withMessage('URL du dépôt invalide.'),
    ],
    validateRequest,
    projectController.addDeliverable
);

router.put(
    '/:id/deliverables/:deliverableId',
    [
        param('id').isMongoId().withMessage('ID de projet invalide.'),
        param('deliverableId').isMongoId().withMessage('ID du livrable invalide.'),
        check('name').optional().notEmpty().withMessage('Le nom ne peut pas être vide.'),
        check('statut').optional().isIn(['PENDING', 'DONE']).withMessage('Statut invalide.'),
    ],
    validateRequest,
    projectController.updateDeliverable
);

router.delete(
    '/:id/deliverables/:deliverableId',
    [
        param('id').isMongoId().withMessage('ID de projet invalide.'),
        param('deliverableId').isMongoId().withMessage('ID du livrable invalide.'),
    ],
    validateRequest,
    projectController.removeDeliverable
);

module.exports = router;