// src/routers/ai.router.js

const express = require('express');
const router = express.Router();
const { generateText } = require('../services/ai.service');

// Endpoint pour générer du texte avec IA
router.post('/generate', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Le champ "prompt" est requis.' });
    }
    try {
        const result = await generateText(prompt);
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;