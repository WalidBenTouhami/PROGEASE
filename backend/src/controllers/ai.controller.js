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
    },

    /**
     * Former des équipes optimisées avec l'IA
     */
    formerEquipes: async (req, res) => {
        try {
            const { membres } = req.body;

            if (!membres || !Array.isArray(membres) || membres.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La liste des membres est requise et doit être non vide'
                });
            }

            const equipes = await aiService.creerEquipes(membres);

            logger.info('Équipes formées avec IA', {
                nombreMembres: membres.length,
                utilisateur: req.utilisateur?.id
            });

            res.status(200).json({
                success: true,
                message: 'Équipes formées avec succès',
                data: equipes
            });
        } catch (error) {
            logger.error('Erreur lors de la formation des équipes:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de la formation des équipes',
                error: error.message
            });
        }
    },

    /**
     * Associer intelligemment tuteurs et projets
     */
    associerTuteurs: async (req, res) => {
        try {
            const { membres } = req.body;

            if (!membres || !Array.isArray(membres) || membres.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La liste des membres et tuteurs est requise'
                });
            }

            const associations = await aiService.associerTuteurs(membres);

            logger.info('Tuteurs associés avec IA', {
                nombreMembres: membres.length,
                utilisateur: req.utilisateur?.id
            });

            res.status(200).json({
                success: true,
                message: 'Tuteurs associés avec succès',
                data: associations
            });
        } catch (error) {
            logger.error('Erreur lors de l\'association des tuteurs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de l\'association des tuteurs',
                error: error.message
            });
        }
    },

    /**
     * Recommander des ressources d'apprentissage personnalisées
     */
    recommanderRessources: async (req, res) => {
        try {
            const { competences } = req.body;

            if (!competences || !Array.isArray(competences) || competences.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La liste des compétences est requise'
                });
            }

            const recommandations = await aiService.recommanderApprentissage(competences);

            logger.info('Ressources d\'apprentissage recommandées', {
                nombreCompetences: competences.length,
                utilisateur: req.utilisateur?.id
            });

            res.status(200).json({
                success: true,
                message: 'Ressources recommandées avec succès',
                data: recommandations
            });
        } catch (error) {
            logger.error('Erreur lors de la recommandation de ressources:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de la recommandation de ressources',
                error: error.message
            });
        }
    },

    /**
     * Prédire la performance d'un projet
     */
    predirePerformance: async (req, res) => {
        try {
            const { projetId } = req.params;
            const { historique } = req.body;

            const prediction = await aiService.predirePerformance(historique || []);

            logger.info('Performance prédite avec IA', {
                projetId,
                utilisateur: req.utilisateur?.id
            });

            res.status(200).json({
                success: true,
                message: 'Performance prédite avec succès',
                data: prediction
            });
        } catch (error) {
            logger.error('Erreur lors de la prédiction de performance:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de la prédiction de performance',
                error: error.message
            });
        }
    },

    /**
     * Suivre la progression automatiquement
     */
    suivreProgression: async (req, res) => {
        try {
            const { taches } = req.body;

            if (!taches || !Array.isArray(taches)) {
                return res.status(400).json({
                    success: false,
                    message: 'La liste des tâches est requise'
                });
            }

            const progression = await aiService.suiviProgression(taches);

            logger.info('Progression calculée automatiquement', {
                nombreTaches: taches.length,
                utilisateur: req.utilisateur?.id
            });

            res.status(200).json({
                success: true,
                message: 'Progression calculée avec succès',
                data: progression
            });
        } catch (error) {
            logger.error('Erreur lors du suivi de progression:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors du suivi de progression',
                error: error.message
            });
        }
    },

    /**
     * Générer un planning intelligent
     */
    genererPlanning: async (req, res) => {
        try {
            const { taches, dateDebut, dateFin } = req.body;

            if (!taches || !Array.isArray(taches) || !dateDebut || !dateFin) {
                return res.status(400).json({
                    success: false,
                    message: 'Les tâches, date de début et date de fin sont requises'
                });
            }

            const planning = await aiService.genererPlanning(taches, dateDebut, dateFin);

            logger.info('Planning généré avec IA', {
                nombreTaches: taches.length,
                utilisateur: req.utilisateur?.id
            });

            res.status(200).json({
                success: true,
                message: 'Planning généré avec succès',
                data: planning
            });
        } catch (error) {
            logger.error('Erreur lors de la génération du planning:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de la génération du planning',
                error: error.message
            });
        }
    }
};

module.exports = aiController; 