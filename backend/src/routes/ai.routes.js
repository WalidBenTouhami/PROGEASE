// src/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const logger = require('../utils/logger');
const { HttpStatus } = require('../../config/constants');

// Middleware pour gérer les erreurs asynchrones
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware de validation des données
const validateInput = (req, res, next) => {
    const data = req.body.data || req.body.donnees;

    if (!data) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'error',
            error: 'Données manquantes. Veuillez fournir "data" ou "donnees".'
        });
    }

    // Normaliser les données pour uniformiser l'accès
    req.donnees = data;
    next();
};

// Middleware de logging
const logRequest = (req, res, next) => {
    logger.info(`Requête AI: ${req.method} ${req.originalUrl}`, {
        user: req.currentUser || 'anonymous',
        dataSize: JSON.stringify(req.body).length
    });
    next();
};

/**
 * @route   POST /api/ai/analyze
 * @desc    Analyser un projet avec l'IA
 * @access  Privé
 */
router.post('/analyze', logRequest, validateInput, catchAsync(async (req, res) => {
    try {
        const analysisResult = await aiService.analyserProjet(req.donnees);

        res.status(HttpStatus.OK).json({
            analysis: analysisResult,
            resultat: analysisResult,
            timestamp: new Date().toISOString(),
            analyzedBy: req.currentUser || 'system'
        });
    } catch (error) {
        logger.error(`❌ Erreur d'analyse AI: ${error.message}`, { stack: error.stack });
        res.status(HttpStatus.INTERNAL_ERROR).json({
            status: 'error',
            error: 'Erreur lors de l\'analyse du projet'
        });
    }
}));

/**
 * @route   POST /api/ai/generer-texte
 * @desc    Générer du texte avec l'IA
 * @access  Privé
 */
router.post('/generer-texte', logRequest, validateInput, catchAsync(async (req, res) => {
    const resultat = await aiService.genererTexte(req.donnees);

    res.status(HttpStatus.OK).json({
        resultat,
        result: resultat,
        timestamp: new Date().toISOString()
    });
}));

/**
 * @route   POST /api/ai/generate-text
 * @desc    Version anglaise pour générer du texte
 * @access  Privé
 */
router.post('/generate-text', logRequest, validateInput, catchAsync(async (req, res) => {
    const resultat = await aiService.genererTexte(req.donnees);

    res.status(HttpStatus.OK).json({
        result: resultat,
        resultat,
        timestamp: new Date().toISOString()
    });
}));

/**
 * @route   POST /api/ai/track-progress
 * @desc    Suivre la progression des tâches
 * @access  Privé
 */
router.post('/track-progress', logRequest, validateInput, catchAsync(async (req, res) => {
    const taches = req.donnees.taches || req.donnees;

    if (!Array.isArray(taches)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'error',
            error: 'Format invalide: un tableau de tâches est requis.'
        });
    }

    const resultat = await aiService.suiviProgression(taches);

    res.status(HttpStatus.OK).json({
        resultat,
        timestamp: new Date().toISOString()
    });
}));

/**
 * @route   POST /api/ai/predict-performance
 * @desc    Prédire la performance basée sur l'historique
 * @access  Privé
 */
router.post('/predict-performance', logRequest, validateInput, catchAsync(async (req, res) => {
    const historique = req.donnees.historique || req.donnees;

    if (!Array.isArray(historique)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'error',
            error: 'Format invalide: un tableau d\'historique est requis.'
        });
    }

    const resultat = await aiService.predirePerformance(historique);

    res.status(HttpStatus.OK).json({
        resultat,
        timestamp: new Date().toISOString()
    });
}));

/**
 * @route   POST /api/ai/build-teams
 * @desc    Former des équipes automatiquement
 * @access  Privé
 */
router.post('/build-teams', logRequest, validateInput, catchAsync(async (req, res) => {
    const membres = req.donnees.membres || req.donnees;

    if (!Array.isArray(membres)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'error',
            error: 'Format invalide: un tableau de membres est requis.'
        });
    }

    const resultat = await aiService.creerEquipes(membres);

    res.status(HttpStatus.OK).json({
        resultat,
        timestamp: new Date().toISOString()
    });
}));

/**
 * @route   POST /api/ai/match-tutors
 * @desc    Associer des tuteurs aux équipes
 * @access  Privé
 */
router.post('/match-tutors', logRequest, validateInput, catchAsync(async (req, res) => {
    const membres = req.donnees.membres || req.donnees;

    if (!Array.isArray(membres)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'error',
            error: 'Format invalide: un tableau de membres est requis.'
        });
    }

    const resultat = await aiService.associerTuteurs(membres);

    res.status(HttpStatus.OK).json({
        resultat,
        timestamp: new Date().toISOString()
    });
}));

/**
 * @route   POST /api/ai/recommend-learning
 * @desc    Recommander des ressources d'apprentissage
 * @access  Privé
 */
router.post('/recommend-learning', logRequest, validateInput, catchAsync(async (req, res) => {
    const competences = req.donnees.competences || req.donnees;

    if (!Array.isArray(competences)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'error',
            error: 'Format invalide: un tableau de compétences est requis.'
        });
    }

    const resultat = await aiService.recommanderApprentissage(competences);

    res.status(HttpStatus.OK).json({
        resultat,
        timestamp: new Date().toISOString()
    });
}));

/**
 * @route   POST /api/ai/schedule-tasks
 * @desc    Générer un planning de tâches
 * @access  Privé
 */
router.post('/schedule-tasks', logRequest, validateInput, catchAsync(async (req, res) => {
    const taches = req.donnees.taches || req.donnees;

    if (!Array.isArray(taches)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'error',
            error: 'Format invalide: un tableau de tâches est requis.'
        });
    }

    const resultat = await aiService.genererPlanning(taches);

    res.status(HttpStatus.OK).json({
        resultat,
        timestamp: new Date().toISOString()
    });
}));

/**
 * @route   GET /api/ai/health
 * @desc    Vérifier l'état du service AI
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.status(HttpStatus.OK).json({
        status: 'ok',
        service: 'ai-service',
        models: ['deepseek'],
        timestamp: new Date().toISOString(),
        user: req.currentUser || 'system',
        version: '2.0.0'
    });
});

// Middleware de gestion d'erreur global pour les routes AI
router.use((err, req, res, next) => {
    logger.error(`❌ Erreur AI API: ${err.message}`, {
        stack: err.stack,
        endpoint: req.originalUrl,
        method: req.method,
        user: req.currentUser || 'anonymous'
    });

    res.status(HttpStatus.INTERNAL_ERROR).json({
        status: 'error',
        error: 'Une erreur est survenue lors du traitement IA.',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
