// src/routes/scheduling.routes.js
const express = require('express');
const router = express.Router();
const schedulingController = require('../controllers/scheduling.controller');
const { rateLimiter } = require('../middlewares/rateLimiter');
const {
    validateProjetId,
    validateEventScheduling,
    validateNotifications,
    validateConflictDetection,
} = require('../middlewares/validation.middleware');

/**
 * @route GET /api/scheduling/reminders/:projetId
 * @desc Génère des rappels automatiques pour un projet
 */
router.get(
    '/reminders/:projetId',
    rateLimiter({ windowMs: 60000, max: 30 }),
    validateProjetId,
    schedulingController.genererRappels
);

/**
 * @route POST /api/scheduling/events/:projetId
 * @desc Planifie des événements pour un projet
 */
router.post(
    '/events/:projetId',
    rateLimiter({ windowMs: 60000, max: 20 }),
    validateEventScheduling,
    schedulingController.planifierEvenements
);

/**
 * @route POST /api/scheduling/notifications
 * @desc Envoie des notifications pour les rappels
 */
router.post(
    '/notifications',
    rateLimiter({ windowMs: 60000, max: 30 }),
    validateNotifications,
    schedulingController.envoyerNotifications
);

/**
 * @route POST /api/scheduling/conflicts
 * @desc Détecte les conflits de planning
 */
router.post(
    '/conflicts',
    rateLimiter({ windowMs: 60000, max: 30 }),
    validateConflictDetection,
    schedulingController.detecterConflits
);

/**
 * @route GET /api/scheduling/complete/:projetId
 * @desc Génère un planning complet avec rappels, événements et conflits
 */
router.get(
    '/complete/:projetId',
    rateLimiter({ windowMs: 60000, max: 20 }),
    validateProjetId,
    schedulingController.genererPlanningComplet
);

/**
 * @route POST /api/scheduling/complete/:projetId
 * @desc Génère un planning complet avec options personnalisées
 */
router.post(
    '/complete/:projetId',
    rateLimiter({ windowMs: 60000, max: 20 }),
    validateProjetId,
    schedulingController.genererPlanningComplet
);

// Route health check
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Scheduling service is operational',
        data: {
            status: 'ok',
            service: 'scheduling-api',
            timestamp: new Date().toISOString(),
            features: [
                'Automated Reminders',
                'Event Scheduling',
                'Conflict Detection',
                'Notification System',
            ],
        },
    });
});

module.exports = router;
