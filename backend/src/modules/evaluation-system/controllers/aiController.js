const aiService = require('../services/aiService');

// @desc    Analyser la progression d'un étudiant
// @route   GET /api/evaluations/ai/progression/:etudiantId
exports.analyserProgression = async (req, res) => {
    try {
        const analyse = await aiService.analyserProgressionEtudiant(req.params.etudiantId);
        res.status(200).json(analyse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Prédire la performance future d'un étudiant
// @route   GET /api/evaluations/ai/prediction/:etudiantId
exports.predirePerformance = async (req, res) => {
    try {
        const prediction = await aiService.predirePerformance(req.params.etudiantId);
        res.status(200).json(prediction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Analyser une équipe
// @route   GET /api/evaluations/ai/equipe/:equipeId
exports.analyserEquipe = async (req, res) => {
    try {
        const analyse = await aiService.analyserEquipe(req.params.equipeId);
        res.status(200).json(analyse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 

// Aicontroller