// src/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const aiService = require('../services/ai.service');
const aiController = require('../controllers/ai.controller');
const { rateLimiter } = require('../middlewares/rateLimiter');
const {
    validateTeamFormation,
    validateTutorMatching,
    validateLearningResources,
    validateProgressTracking,
    validateScheduleGeneration,
    validateProjectAnalysis,
    validateProjetId,
    validateLivrableId,
} = require('../middlewares/validation.middleware');

/**
 * @route POST /api/ai/analyze
 * @desc Analyse un projet avec l'IA
 */
router.post(
    '/analyze',
    rateLimiter({ windowMs: 60000, max: 10 }),
    validateProjectAnalysis,
    aiController.analyserProjet
);

/**
 * @route POST /api/ai/recommendations
 * @desc Génère des recommandations pour un projet
 */
router.post(
    '/recommendations/:projetId',
    rateLimiter({ windowMs: 60000, max: 10 }),
    validateProjetId,
    aiController.genererRecommandations
);

/**
 * @route POST /api/ai/analyze-livrables
 * @desc Analyse les livrables d'un projet
 */
router.post(
    '/analyze-livrables/:projetId',
    rateLimiter({ windowMs: 60000, max: 10 }),
    validateProjetId,
    aiController.analyserLivrables
);

/**
 * @route POST /api/ai/evaluate-livrable
 * @desc Évalue un livrable
 */
router.post(
    '/evaluate-livrable/:livrableId',
    rateLimiter({ windowMs: 60000, max: 10 }),
    validateLivrableId,
    aiController.evaluerLivrable
);

/**
 * @route GET /api/ai/progress-report
 * @desc Génère un rapport d'avancement
 */
router.get(
    '/progress-report/:projetId',
    rateLimiter({ windowMs: 60000, max: 20 }),
    validateProjetId,
    aiController.genererRapportAvancement
);

/**
 * @route POST /api/ai/form-teams
 * @desc Forme des équipes optimisées avec l'IA
 */
router.post(
    '/form-teams',
    rateLimiter({ windowMs: 60000, max: 10 }),
    validateTeamFormation,
    aiController.formerEquipes
);

/**
 * @route POST /api/ai/match-tutors
 * @desc Associe intelligemment tuteurs et projets
 */
router.post(
    '/match-tutors',
    rateLimiter({ windowMs: 60000, max: 10 }),
    validateTutorMatching,
    aiController.associerTuteurs
);

/**
 * @route POST /api/ai/learning-resources
 * @desc Recommande des ressources d'apprentissage personnalisées
 */
router.post(
    '/learning-resources',
    rateLimiter({ windowMs: 60000, max: 20 }),
    validateLearningResources,
    aiController.recommanderRessources
);

/**
 * @route POST /api/ai/predict-performance
 * @desc Prédit la performance d'un projet
 */
router.post(
    '/predict-performance/:projetId',
    rateLimiter({ windowMs: 60000, max: 10 }),
    validateProjetId,
    aiController.predirePerformance
);

/**
 * @route POST /api/ai/track-progress
 * @desc Suit automatiquement la progression
 */
router.post(
    '/track-progress',
    rateLimiter({ windowMs: 60000, max: 20 }),
    validateProgressTracking,
    aiController.suivreProgression
);

/**
 * @route POST /api/ai/generate-schedule
 * @desc Génère un planning intelligent
 */
router.post(
    '/generate-schedule',
    rateLimiter({ windowMs: 60000, max: 10 }),
    validateScheduleGeneration,
    aiController.genererPlanning
);

// Route health
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Health check OK',
        data: {
            status: 'ok',
            service: 'ai-api',
            timestamp: new Date().toISOString(),
            model: 'deepseek-test',
            features: [
                'Smart Team Formation',
                'Intelligent Tutor Matching',
                'Predictive Performance Analytics',
                'Automated Progress Tracking',
                'Personalized Learning Resources',
                'Automated Scheduling',
            ],
        },
    });
});

module.exports = router;
