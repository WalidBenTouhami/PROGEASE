const express = require('express');
const { generateText } = require('../services/ai.service');
const router = express.Router();

// Route POST pour générer du texte
router.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
    const result = await generateText(prompt);
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la génération de texte' });
  }
});

// Route POST pour recevoir des données génériques
router.post('/', (req, res) => {
  const data = req.body; // Récupère les données envoyées dans le corps de la requête
  res.status(201).json({ message: 'Données reçues', data });
});

module.exports = router;