// src/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const aiService = require('../services/ai.service');

// Endpoint d'analyse IA
router.post('/analyze', async (req, res) => {
    try {
        const { text, document } = req.body;
        if (!text && !document) {
            return res.status(400).json({
                success: false,
                message: "Aucun contenu à analyser",
                error: "Aucun contenu à analyser"
            });
        }
        // On passe tout le body pour permettre l'analyse flexible
        const analyse = await aiService.analyserProjet({ text, document });
        logger.monitoring('Analyse IA effectuee', { user: req.currentUser });
        res.status(200).json({
            success: true,
            message: 'Analyse IA effectuee avec succes',
            data: analyse
        });
    } catch (error) {
        logger.error("Erreur lors de l'analyse AI:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne lors de l'analyse",
            error: error.message
        });
    }
});

// Route pour generer du texte (français)
router.post('/generer-texte', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: "Le prompt est requis",
                error: "Le prompt est requis"
            });
        }
        const texte = await aiService.genererTexte(prompt);
        logger.monitoring('Generation de texte IA (FR)', { user: req.currentUser });
        res.status(200).json({
            success: true,
            message: 'Texte genere avec succes',
            data: {
                text: texte,
                prompt: prompt.substring(0, 100),
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.error("Erreur lors de la generation de texte:", error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la generation de texte',
            error: error.message
        });
    }
});

// Alias en anglais
router.post('/generate-text', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required",
                error: "Prompt is required"
            });
        }
        const texte = await aiService.genererTexte(prompt);
        logger.monitoring('Generation de texte IA (EN)', { user: req.currentUser });
        res.status(200).json({
            success: true,
            message: 'Text generated successfully',
            data: {
                text: texte,
                prompt: prompt.substring(0, 100),
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.error("Error generating text:", error);
        res.status(500).json({
            success: false,
            message: 'Error generating text',
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
