// src/routers/ai.router.js

const express = require('express');
const router = express.Router();
const { generateText, summarizeNotes, generateTaskList } = require('../services/ai.service');

// Middleware pour gérer les erreurs asynchrones
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Utilitaire : Valider le champ requis
const validateField = (field, req, res) => {
    if (!req.body[field]) {
        res.status(400).json({ error: `Le champ "${field}" est requis.` });
        return false;
    }
    return true;
};

// Endpoint : Générer du texte avec IA
router.post('/generate-text', catchAsync(async (req, res) => {
    if (!validateField('prompt', req, res)) return;
    const result = await generateText(req.body.prompt);
    res.status(200).json({ result });
}));

// Endpoint : Résumer des notes
router.post('/summarize-notes', catchAsync(async (req, res) => {
    if (!validateField('notes', req, res)) return;
    const summary = await summarizeNotes(req.body.notes);
    res.status(200).json({ summary });
}));

// Endpoint : Générer une liste de tâches
router.post('/generate-task-list', catchAsync(async (req, res) => {
    if (!validateField('description', req, res)) return;
    const tasks = await generateTaskList(req.body.description);
    res.status(200).json({ tasks });
}));

// Gestion des erreurs globales
router.use((err, req, res, next) => {
    console.error('❌ Erreur attrapée dans le middleware global :', err);
    res.status(500).json({ error: 'Une erreur interne est survenue. Veuillez réessayer plus tard.' });
});

module.exports = router;