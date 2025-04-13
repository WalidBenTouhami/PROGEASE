const Evaluation = require('../models/Evaluation');
const logger = require('../../../config/logging');

class AIService {
    /**
     * Analyse les tendances des évaluations d'un étudiant
     * @param {string} etudiantId - ID de l'étudiant
     */
    async analyserProgressionEtudiant(etudiantId) {
        try {
            const evaluations = await Evaluation.find({ etudiantId })
                .sort({ dateCreation: 1 })
                .populate('projetId', 'titre competencesRequises');

            if (evaluations.length < 2) {
                return {
                    progression: null,
                    recommandations: ['Pas assez de données pour une analyse approfondie']
                };
            }

            // Calculer la progression
            const progression = this._calculerProgression(evaluations);
            
            // Générer des recommandations personnalisées
            const recommandations = this._genererRecommandations(progression, evaluations);

            return { progression, recommandations };
        } catch (error) {
            logger.error(`Erreur lors de l'analyse de progression: ${error.message}`);
            throw error;
        }
    }

    /**
     * Prédire la performance future d'un étudiant
     * @param {string} etudiantId - ID de l'étudiant
     */
    async predirePerformance(etudiantId) {
        try {
            const evaluations = await Evaluation.find({ etudiantId })
                .sort({ dateCreation: 1 });

            if (evaluations.length < 3) {
                return {
                    prediction: null,
                    fiabilite: 0,
                    message: 'Pas assez de données pour une prédiction fiable'
                };
            }

            // Analyse des tendances récentes
            const notes = evaluations.map(e => e.note);
            const prediction = this._calculerPrediction(notes);

            return {
                prediction: Math.round(prediction * 100) / 100,
                fiabilite: this._calculerFiabilite(notes),
                message: this._genererMessagePrediction(prediction)
            };
        } catch (error) {
            logger.error(`Erreur lors de la prédiction: ${error.message}`);
            throw error;
        }
    }

    /**
     * Identifier les points forts et faibles d'une équipe
     * @param {string} equipeId - ID de l'équipe
     */
    async analyserEquipe(equipeId) {
        try {
            const evaluations = await Evaluation.find({ equipeId })
                .populate('projetId', 'titre competencesRequises');

            const pointsForts = [];
            const pointsAmelioration = [];
            let moyenneEquipe = 0;

            if (evaluations.length > 0) {
                moyenneEquipe = evaluations.reduce((acc, curr) => acc + curr.note, 0) / evaluations.length;

                // Analyse des commentaires pour identifier les points forts/faibles
                evaluations.forEach(evaluation => {
                    const analyse = this._analyserCommentaires(evaluation.commentaires);
                    pointsForts.push(...analyse.pointsForts);
                    pointsAmelioration.push(...analyse.pointsAmelioration);
                });
            }

            return {
                moyenneEquipe: Math.round(moyenneEquipe * 100) / 100,
                pointsForts: [...new Set(pointsForts)],
                pointsAmelioration: [...new Set(pointsAmelioration)],
                recommandations: this._genererRecommandationsEquipe(pointsAmelioration)
            };
        } catch (error) {
            logger.error(`Erreur lors de l'analyse d'équipe: ${error.message}`);
            throw error;
        }
    }

    // Méthodes privées d'aide
    _calculerProgression(evaluations) {
        const notes = evaluations.map(e => e.note);
        const progression = notes[notes.length - 1] - notes[0];
        return Math.round(progression * 100) / 100;
    }

    _calculerPrediction(notes) {
        // Utilisation d'une régression linéaire simple
        const n = notes.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        notes.forEach((note, i) => {
            sumX += i;
            sumY += note;
            sumXY += i * note;
            sumXX += i * i;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return intercept + slope * n; // Prédiction pour la prochaine évaluation
    }

    _calculerFiabilite(notes) {
        // Plus il y a de notes, plus la fiabilité augmente (plafonné à 0.9)
        return Math.min(0.9, notes.length * 0.15);
    }

    _analyserCommentaires(commentaires) {
        const pointsForts = [];
        const pointsAmelioration = [];

        if (!commentaires) return { pointsForts, pointsAmelioration };

        // Mots-clés positifs
        const positifs = ['excellent', 'bien', 'fort', 'maîtrise', 'qualité'];
        // Mots-clés négatifs
        const negatifs = ['améliorer', 'faible', 'difficulté', 'manque', 'insuffisant'];

        const mots = commentaires.toLowerCase().split(' ');
        
        mots.forEach((mot, index) => {
            if (positifs.some(p => mot.includes(p))) {
                // Capturer le contexte (mot suivant)
                if (mots[index + 1]) {
                    pointsForts.push(mots[index + 1]);
                }
            }
            if (negatifs.some(n => mot.includes(n))) {
                if (mots[index + 1]) {
                    pointsAmelioration.push(mots[index + 1]);
                }
            }
        });

        return { pointsForts, pointsAmelioration };
    }

    _genererRecommandations(progression, evaluations) {
        const recommandations = [];

        if (progression > 0) {
            recommandations.push('Continuez sur cette lancée positive');
        } else if (progression < 0) {
            recommandations.push('Un suivi plus régulier pourrait être bénéfique');
        }

        // Analyse des commentaires récents
        const derniersCommentaires = evaluations.slice(-2);
        derniersCommentaires.forEach(evaluation => {
            if (evaluation.commentaires) {
                const analyse = this._analyserCommentaires(evaluation.commentaires);
                analyse.pointsAmelioration.forEach(point => {
                    recommandations.push(`Concentrez-vous sur l'amélioration de: ${point}`);
                });
            }
        });

        return recommandations;
    }

    _genererMessagePrediction(prediction) {
        if (prediction >= 15) {
            return "L'étudiant montre une excellente trajectoire";
        } else if (prediction >= 12) {
            return "L'étudiant progresse de manière satisfaisante";
        } else {
            return "Un soutien supplémentaire pourrait être nécessaire";
        }
    }

    _genererRecommandationsEquipe(pointsAmelioration) {
        return pointsAmelioration.map(point => {
            return `Suggestion d'amélioration pour l'équipe: ${point}`;
        });
    }
}

module.exports = new AIService(); 