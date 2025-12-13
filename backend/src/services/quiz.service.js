const Quiz = require('../models/quiz.model');
const logger = require('../utils/logger');
const { formatQuizResponse } = require('../utils/formatters');

/**
 * Crée un nouveau quiz
 * @param {Object} data - Données du quiz
 * @returns {Promise<Object>} - Quiz créé
 */
async function creerQuiz(data) {
    try {
        const quiz = new Quiz({
            ...data,
            creeLe: new Date(),
            majLe: new Date(),
        });

        const quizSauvegarde = await quiz.save();
        return formatQuizResponse(quizSauvegarde);
    } catch (error) {
        logger.error(`Erreur lors de la création du quiz: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Récupère tous les quiz avec pagination et filtres
 * @param {Object} options - Options de filtrage et pagination
 * @returns {Promise<Object>} - Liste des quiz et métadonnées
 */
async function recupererQuiz(options = {}) {
    try {
        const {
            page = 1,
            limite = 10,
            recherche,
            categorie,
            niveau,
            auteur,
            tri = 'recent',
        } = options;

        const query = {};
        if (recherche) {
            query.$or = [
                { titre: { $regex: recherche, $options: 'i' } },
                { description: { $regex: recherche, $options: 'i' } },
            ];
        }
        if (categorie) query.categorie = categorie;
        if (niveau) query.niveau = niveau;
        if (auteur) query.auteur = auteur;

        const skip = (page - 1) * limite;
        let sort = {};
        switch (tri) {
        case 'recent':
            sort = { creeLe: -1 };
            break;
        case 'populaire':
            sort = { nombreParticipations: -1 };
            break;
        case 'difficulte':
            sort = { niveau: 1 };
            break;
        default:
            sort = { creeLe: -1 };
        }

        const [quiz, total] = await Promise.all([
            Quiz.find(query)
                .populate('auteur', 'nom prenom avatar')
                .sort(sort)
                .skip(skip)
                .limit(limite)
                .lean(),
            Quiz.countDocuments(query),
        ]);

        return {
            quiz: quiz.map(formatQuizResponse),
            page,
            totalPages: Math.ceil(total / limite),
            total,
        };
    } catch (error) {
        logger.error(`Erreur lors de la récupération des quiz: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Récupère un quiz par son ID
 * @param {string} id - ID du quiz
 * @returns {Promise<Object>} - Quiz trouvé
 */
async function recupererQuizParId(id) {
    try {
        const quiz = await Quiz.findById(id).populate('auteur', 'nom prenom avatar').lean();

        if (!quiz) {
            throw new Error('Quiz non trouvé');
        }

        return formatQuizResponse(quiz);
    } catch (error) {
        logger.error(`Erreur lors de la récupération du quiz: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Met à jour un quiz
 * @param {string} id - ID du quiz
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} - Quiz mis à jour
 */
async function mettreAJourQuiz(id, data) {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            id,
            {
                ...data,
                majLe: new Date(),
            },
            { new: true, runValidators: true }
        ).populate('auteur', 'nom prenom avatar');

        if (!quiz) {
            throw new Error('Quiz non trouvé');
        }

        return formatQuizResponse(quiz);
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour du quiz: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Supprime un quiz
 * @param {string} id - ID du quiz
 * @returns {Promise<boolean>} - Succès de la suppression
 */
async function supprimerQuiz(id) {
    try {
        const quiz = await Quiz.findByIdAndDelete(id);
        if (!quiz) {
            throw new Error('Quiz non trouvé');
        }
        return true;
    } catch (error) {
        logger.error(`Erreur lors de la suppression du quiz: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Soumet une réponse à un quiz
 * @param {string} quizId - ID du quiz
 * @param {string} utilisateurId - ID de l'utilisateur
 * @param {Array} reponses - Réponses soumises
 * @returns {Promise<Object>} - Résultat du quiz
 */
async function soumettreReponses(quizId, utilisateurId, reponses) {
    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            throw new Error('Quiz non trouvé');
        }

        let score = 0;
        const resultatsDetailles = [];

        quiz.questions.forEach((question, index) => {
            const reponseUtilisateur = reponses[index];
            const estCorrecte = question.reponseCorrecte === reponseUtilisateur;

            if (estCorrecte) {
                score += question.points || 1;
            }

            resultatsDetailles.push({
                question: question.texte,
                reponseUtilisateur,
                reponseCorrecte: question.reponseCorrecte,
                estCorrecte,
                points: estCorrecte ? question.points || 1 : 0,
            });
        });

        const resultat = {
            quiz: quizId,
            utilisateur: utilisateurId,
            reponses,
            score,
            scoreMaximum: quiz.questions.reduce((total, q) => total + (q.points || 1), 0),
            resultatsDetailles,
            dateSoumission: new Date(),
        };

        quiz.participations.push(resultat);
        quiz.nombreParticipations = (quiz.nombreParticipations || 0) + 1;
        quiz.scoreTotal = (quiz.scoreTotal || 0) + score;
        quiz.scoreMoyen = quiz.scoreTotal / quiz.nombreParticipations;

        await quiz.save();

        return resultat;
    } catch (error) {
        logger.error(`Erreur lors de la soumission des réponses: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Récupère les statistiques d'un quiz
 * @param {string} id - ID du quiz
 * @returns {Promise<Object>} - Statistiques du quiz
 */
async function recupererStatistiques(id) {
    try {
        const quiz = await Quiz.findById(id).lean();
        if (!quiz) {
            throw new Error('Quiz non trouvé');
        }

        const participations = quiz.participations || [];
        const nombreParticipations = participations.length;
        const scoreMaximum = quiz.questions.reduce((total, q) => total + (q.points || 1), 0);

        const stats = {
            nombreParticipations,
            scoreMoyen: nombreParticipations > 0 ? quiz.scoreTotal / nombreParticipations : 0,
            scoreMaximum,
            tauxReussite:
                nombreParticipations > 0
                    ? (participations.filter(p => p.score >= scoreMaximum * 0.7).length /
                          nombreParticipations) *
                      100
                    : 0,
            repartitionScores: {
                excellent: participations.filter(p => p.score >= scoreMaximum * 0.9).length,
                bon: participations.filter(
                    p => p.score >= scoreMaximum * 0.7 && p.score < scoreMaximum * 0.9
                ).length,
                moyen: participations.filter(
                    p => p.score >= scoreMaximum * 0.5 && p.score < scoreMaximum * 0.7
                ).length,
                faible: participations.filter(p => p.score < scoreMaximum * 0.5).length,
            },
            questionsStats: quiz.questions.map((question, index) => ({
                texte: question.texte,
                tauxReussite:
                    nombreParticipations > 0
                        ? (participations.filter(p => p.resultatsDetailles[index].estCorrecte)
                            .length /
                              nombreParticipations) *
                          100
                        : 0,
            })),
        };

        return stats;
    } catch (error) {
        logger.error(`Erreur lors de la récupération des statistiques: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

module.exports = {
    creerQuiz,
    recupererQuiz,
    recupererQuizParId,
    mettreAJourQuiz,
    supprimerQuiz,
    soumettreReponses,
    recupererStatistiques,
};
