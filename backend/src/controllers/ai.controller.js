const aiService = require('../services/ai.service');
const logger = require('../utils/logger');

/**
 * Analyse un projet avec l'IA
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
async function analyserProjet(req, res) {
    try {
        const { text, document } = req.body;

        if (!text || !document) {
            return res.status(400).json({
                success: false,
                message: 'Les données du projet sont requises'
            });
        }

        const analyse = await aiService.analyserProjet({ text, document });

        res.json({
            success: true,
            message: 'Analyse générée avec succès',
            data: analyse
        });
    } catch (error) {
        logger.error('Erreur lors de l\'analyse du projet:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne lors de l\'analyse',
            error: error.message
        });
    }
}

/**
 * Génère du texte avec l'IA
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
async function genererTexte(req, res) {
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
            message: 'Texte généré avec succès',
            data: texte
        });
    } catch (error) {
        logger.error('Erreur lors de la génération de texte:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne lors de la génération de texte',
            error: error.message
        });
    }
}

module.exports = {
    analyserProjet,
    genererTexte
}; 