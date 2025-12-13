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
        },
    });
});

module.exports = router;
