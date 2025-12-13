// src/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const aiService = require('../services/ai.service');
const aiController = require('../controllers/ai.controller');

/**
 * @route POST /api/ai/analyze
 * @desc Analyse un projet avec l'IA
 */
router.post('/analyze', aiController.analyserProjet);

/**
 * @route POST /api/ai/recommendations
 * @desc Génère des recommandations pour un projet
 */
router.post('/recommendations/:projetId', aiController.genererRecommandations);

/**
 * @route POST /api/ai/analyze-livrables
 * @desc Analyse les livrables d'un projet
 */
router.post('/analyze-livrables/:projetId', aiController.analyserLivrables);

/**
 * @route POST /api/ai/evaluate-livrable
 * @desc Évalue un livrable
 */
router.post('/evaluate-livrable/:livrableId', aiController.evaluerLivrable);

/**
 * @route GET /api/ai/progress-report
 * @desc Génère un rapport d'avancement
 */
router.get('/progress-report/:projetId', aiController.genererRapportAvancement);

/**
 * @route POST /api/ai/form-teams
 * @desc Forme des équipes optimisées avec l'IA
 */
router.post('/form-teams', aiController.formerEquipes);

/**
 * @route POST /api/ai/match-tutors
 * @desc Associe intelligemment tuteurs et projets
 */
router.post('/match-tutors', aiController.associerTuteurs);

/**
 * @route POST /api/ai/learning-resources
 * @desc Recommande des ressources d'apprentissage personnalisées
 */
router.post('/learning-resources', aiController.recommanderRessources);

/**
 * @route POST /api/ai/predict-performance
 * @desc Prédit la performance d'un projet
 */
router.post('/predict-performance/:projetId', aiController.predirePerformance);

/**
 * @route POST /api/ai/track-progress
 * @desc Suit automatiquement la progression
 */
router.post('/track-progress', aiController.suivreProgression);

/**
 * @route POST /api/ai/generate-schedule
 * @desc Génère un planning intelligent
 */
router.post('/generate-schedule', aiController.genererPlanning);

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
                'Automated Scheduling'
            ]
        }
    });
});

module.exports = router;
