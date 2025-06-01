const { Quiz, QuizResultat } = require('../models/quiz.model');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Créer un nouveau quiz
 */
exports.creerQuiz = async (req, res) => {
    try {
        const { titre, description, formationId, moduleId, questions, noteMinimale, dureeEstimee } = req.body;

        // Validation des données
        if (!titre || !description || !formationId || !questions || !questions.length) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides pour la création du quiz'
            });
        }

        const quiz = new Quiz({
            titre,
            description,
            formationId,
            moduleId,
            auteur: req.utilisateur.id,
            questions,
            noteMinimale: noteMinimale || 60,
            dureeEstimee: dureeEstimee || 30
        });

        await quiz.save();

        logger.monitoring('Quiz créé', {
            quizId: quiz._id,
            formationId,
            moduleId,
            auteur: req.utilisateur.id
        });

        res.status(201).json({
            success: true,
            message: 'Quiz créé avec succès',
            data: quiz
        });
    } catch (error) {
        logger.error('Erreur lors de la création du quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du quiz',
            error: error.message
        });
    }
};

/**
 * Récupérer tous les quiz
 */
exports.recupererQuiz = async (req, res) => {
    try {
        const { formationId, moduleId, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (formationId) filter.formationId = formationId;
        if (moduleId) filter.moduleId = moduleId;

        const quiz = await Quiz.find(filter)
            .select('-questions.options.estCorrecte')
            .populate('auteur', 'nom prenom')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ creeLe: -1 });

        const total = await Quiz.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Quiz récupérés avec succès',
            data: {
                items: quiz,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des quiz',
            error: error.message
        });
    }
};

/**
 * Récupérer un quiz par son ID
 */
exports.recupererQuizParId = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .select('-questions.options.estCorrecte')
            .populate('auteur', 'nom prenom');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Quiz récupéré avec succès',
            data: quiz
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération du quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du quiz',
            error: error.message
        });
    }
};

/**
 * Soumettre un quiz
 */
exports.soumettreQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { reponses } = req.body;
        const utilisateurId = req.utilisateur.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz non trouvé'
            });
        }

        // Vérifier le nombre de tentatives
        const tentatives = await QuizResultat.countDocuments({
            quiz: quizId,
            utilisateur: utilisateurId
        });

        if (tentatives >= quiz.tentativesMax) {
            return res.status(400).json({
                success: false,
                message: 'Nombre maximum de tentatives atteint'
            });
        }

        // Calculer le score
        let score = 0;
        const reponsesEvaluees = quiz.questions.map((question, index) => {
            const reponseUtilisateur = reponses[index];
            let estCorrecte = false;
            let points = 0;

            if (question.type === 'TEXTE_LIBRE') {
                estCorrecte = question.options.some(opt => 
                    opt.texte.toLowerCase().trim() === reponseUtilisateur?.toLowerCase().trim()
                );
            } else {
                estCorrecte = question.options
                    .filter(opt => reponseUtilisateur?.includes(opt._id.toString()))
                    .every(opt => opt.estCorrecte);
            }

            if (estCorrecte) {
                points = question.points;
                score += points;
            }

            return {
                question: question._id,
                reponsesDonnees: reponseUtilisateur,
                estCorrecte,
                points
            };
        });

        const scoreTotal = quiz.questions.reduce((total, q) => total + q.points, 0);
        const pourcentage = (score / scoreTotal) * 100;
        const estReussi = pourcentage >= quiz.noteMinimale;

        // Enregistrer le résultat
        const resultat = new QuizResultat({
            quiz: quizId,
            utilisateur: utilisateurId,
            reponses: reponsesEvaluees,
            note: pourcentage,
            estReussi,
            tempsPasseEnSecondes: req.body.tempsPasseEnSecondes || 0,
            numeroTentative: tentatives + 1,
            dateDebut: req.body.dateDebut,
            dateFin: new Date()
        });

        await resultat.save();

        logger.monitoring('Quiz soumis', {
            quizId,
            utilisateurId,
            score: pourcentage,
            estReussi
        });

        res.status(200).json({
            success: true,
            message: 'Quiz soumis avec succès',
            data: {
                score: pourcentage,
                estReussi,
                reponses: reponsesEvaluees,
                tentativesRestantes: quiz.tentativesMax - (tentatives + 1)
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la soumission du quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la soumission du quiz',
            error: error.message
        });
    }
};

/**
 * Récupérer les statistiques d'un quiz
 */
exports.recupererStatistiques = async (req, res) => {
    try {
        const { quizId } = req.params;

        const resultats = await QuizResultat.find({ quiz: quizId });
        const nombreTentatives = resultats.length;
        const nombreReussites = resultats.filter(r => r.estReussi).length;
        const moyenneNotes = resultats.reduce((acc, r) => acc + r.note, 0) / nombreTentatives;

        const questionStats = await QuizResultat.aggregate([
            { $match: { quiz: mongoose.Types.ObjectId(quizId) } },
            { $unwind: '$reponses' },
            {
                $group: {
                    _id: '$reponses.question',
                    totalTentatives: { $sum: 1 },
                    reussites: {
                        $sum: { $cond: ['$reponses.estCorrecte', 1, 0] }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Statistiques récupérées avec succès',
            data: {
                nombreTentatives,
                nombreReussites,
                tauxReussite: (nombreReussites / nombreTentatives) * 100,
                moyenneNotes,
                questionStats
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
};

module.exports = {
    creerQuiz,
    recupererQuiz,
    recupererQuizParId,
    soumettreQuiz,
    recupererStatistiques
};
