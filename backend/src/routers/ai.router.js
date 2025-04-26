// src/routers/ai.router.js


// backend/src/routers/ai.router.js
const express = require('express');
const router = express.Router();

// Exemple de route AI
router.get('/', (req, res) => {
    res.send('AI Router fonctionne correctement');
});

module.exports = router;