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
 * @route POST /api/ai/generer-texte
 * @desc Genere du texte en français
 */
router.post('/generer-texte', aiController.genererTexte);

/**
 * @route POST /api/ai/generate-text
 * @desc Generates text in English
 */
router.post('/generate-text', aiController.genererTexte);

// Route health
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Health check OK',
        data: {
            status: 'ok',
            service: 'ai-api',
            timestamp: new Date().toISOString(),
            model: 'deepseek-test'
        }
    });
});

module.exports = router;
