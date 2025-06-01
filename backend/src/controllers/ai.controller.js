const aiService = require('../services/ai.service');
const logger = require('../utils/logger');

const aiController = {
    /**
     * Analyse un projet avec l'IA
     */
    analyserProjet: async (req, res) => {
        try {
            const { projetId, contenu, type } = req.body;

            if (!projetId || !contenu) {
                return res.status(400).json({
                    success: false,
                    message: 'Les données du projet sont requises'
                });
            }

            const analyse = await aiService.analyserProjet({
                projetId,
                contenu,
                type: type || 'GENERAL'
            });

            logger.info('Analyse IA effectuée', {
                projetId,
                type,
                utilisateur: req.utilisateur?.id
            });

            res.status(200).json({
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
    },

    /**
     * Générer des recommandations pour un projet
     */
    genererRecommandations: async (req, res) => {
        try {
            const { projetId } = req.params;
            const recommandations = await aiService.genererRecommandations(projetId);

            logger.info('Recommandations IA générées', {
                projetId,
                utilisateur: req.utilisateur?.id
            });

            res.status(200).json({
                success: true,
                message: 'Recommandations générées avec succès',
                data: recommandations
            });
        } catch (error) {
            logger.error('Erreur lors de la génération des recommandations:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de la génération des recommandations',
                error: error.message
            });
        }
    },

    /**
     * Analyser les livrables d'un projet
     */
    analyserLivrables: async (req, res) => {
        try {
            const { projetId } = req.params;
            const analyse = await aiService.analyserLivrables(projetId);

            logger.info('Analyse des livrables effectuée', {
                projetId,
                utilisateur: req.utilisateur?.id
            });

            res.status(200).json({
                success: true,
                message: 'Analyse des livrables effectuée avec succès',
                data: analyse
            });
        } catch (error) {
            logger.error('Erreur lors de l\'analyse des livrables:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de l\'analyse des livrables',
                error: error.message
            });
        }
    },

    /**
     * Évaluer automatiquement un livrable
     */
    evaluerLivrable: async (req, res) => {
        try {
            const { livrableId } = req.params;
            const evaluation = await aiService.evaluerLivrable(livrableId);

            logger.info('Évaluation IA du livrable effectuée', {
                livrableId,
                utilisateur: req.utilisateur?.id
            });

            res.status(200).json({
                success: true,
                message: 'Évaluation du livrable effectuée avec succès',
                data: evaluation
            });
        } catch (error) {
            logger.error('Erreur lors de l\'évaluation du livrable:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de l\'évaluation du livrable',
                error: error.message
            });
        }
    },

    /**
     * Générer un rapport d'avancement
     */
    genererRapportAvancement: async (req, res) => {
        try {
            const { projetId } = req.params;
            const { format = 'PDF' } = req.query;
            
            const rapport = await aiService.genererRapportAvancement(projetId, format);

            logger.info('Rapport d\'avancement généré', {
                projetId,
                format,
                utilisateur: req.utilisateur?.id
            });

            res.status(200).json({
                success: true,
                message: 'Rapport d\'avancement généré avec succès',
                data: rapport
            });
        } catch (error) {
            logger.error('Erreur lors de la génération du rapport:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de la génération du rapport',
                error: error.message
            });
        }
    }
};

module.exports = aiController; 