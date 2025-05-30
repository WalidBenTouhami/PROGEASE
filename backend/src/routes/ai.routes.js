// src/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const aiService = require('../services/ai.service');

/**
 * @route POST /api/ai/analyze
 * @desc Analyse un projet avec l'IA
 */
router.post('/analyze', async (req, res) => {
    try {
        const resultat = await aiService.analyserProjet(req.body);
        res.json(resultat);
    } catch (error) {
        logger.error('Erreur lors de l\'analyse:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne lors de l\'analyse',
            error: error.message
        });
    }
});

/**
 * @route POST /api/ai/generer-texte
 * @desc Genere du texte en français
 */
router.post('/generer-texte', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Le prompt est requis'
            });
        }

        const texte = await aiService.genererTexte(prompt);
        res.json({
            success: true,
            texte
        });
    } catch (error) {
        logger.error('Erreur lors de la generation de texte:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne lors de la generation de texte',
            error: error.message
        });
    }
});

/**
 * @route POST /api/ai/generate-text
 * @desc Generates text in English
 */
router.post('/generate-text', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required'
            });
        }

        const text = await aiService.genererTexte(prompt);
        res.json({
            success: true,
            text
        });
    } catch (error) {
        logger.error('Error generating text:', error);
        res.status(500).json({
            success: false,
            message: 'Internal error while generating text',
            error: error.message
        });
    }
});

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
