/**
 * Middleware de validation pour les quiz
 * @module middlewares/quiz
 * @author WalidBenTouhami
 * @version 2.0.0
 * @updated 2025-06-01
 */

'use strict';

const { ValidationError } = require('./errorHandlers');
const logger = require('../utils/logger');
const { validateCreationQuizData, validateMiseAJourQuizData, validateSoumissionReponsesData, validateId } = require('../validations/quiz.validation');
const Quiz = require('../models/quiz.model');

/**
 * Middleware de validation pour la création d'un quiz
 */
const validateCreation = async (req, res, next) => {
    try {
        await validateCreationQuizData(req.body);
        next();
    } catch (error) {
        logger.warn('Validation de la création du quiz échouée', {
            path: req.path,
            method: req.method,
            errors: error.details
        });
        next(new ValidationError('Validation de la création du quiz échouée', error.details));
    }
};

/**
 * Middleware de validation pour la mise à jour d'un quiz
 */
const validateMiseAJour = async (req, res, next) => {
    try {
        await validateMiseAJourQuizData(req.body);
        next();
    } catch (error) {
        logger.warn('Validation de la mise à jour du quiz échouée', {
            path: req.path,
            method: req.method,
            errors: error.details
        });
        next(new ValidationError('Validation de la mise à jour du quiz échouée', error.details));
    }
};

/**
 * Middleware de validation pour la soumission des réponses
 */
const validateSoumissionReponses = async (req, res, next) => {
    try {
        await validateSoumissionReponsesData(req.body);
        next();
    } catch (error) {
        logger.warn('Validation de la soumission des réponses échouée', {
            path: req.path,
            method: req.method,
            errors: error.details
        });
        next(new ValidationError('Validation de la soumission des réponses échouée', error.details));
    }
};

/**
 * Middleware de vérification de propriété
 */
const verifierProprietaire = async (req, res, next) => {
    try {
        validateId(req.params.id);

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz non trouvé'
            });
        }

        if (quiz.auteur.toString() !== req.utilisateur.id && !req.utilisateur.roles.includes('ADMIN')) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        req.quiz = quiz;
        next();
    } catch (error) {
        logger.error('Erreur lors de la vérification du propriétaire:', error);
        next(error);
    }
};

/**
 * Middleware de vérification d'accès au quiz
 */
const verifierAcces = async (req, res, next) => {
    try {
        validateId(req.params.id);

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz non trouvé'
            });
        }

        if (!quiz.estPublic && quiz.auteur.toString() !== req.utilisateur.id && !req.utilisateur.roles.includes('ADMIN')) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        req.quiz = quiz;
        next();
    } catch (error) {
        logger.error('Erreur lors de la vérification de l\'accès:', error);
        next(error);
    }
};

/**
 * Middleware de vérification de la participation
 */
const verifierParticipation = async (req, res, next) => {
    try {
        validateId(req.params.id);

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz non trouvé'
            });
        }

        const dejaParticipe = quiz.participations.some(p => 
            p.utilisateur.toString() === req.utilisateur.id
        );

        if (dejaParticipe) {
            return res.status(400).json({
                success: false,
                message: 'Vous avez déjà participé à ce quiz'
            });
        }

        req.quiz = quiz;
        next();
    } catch (error) {
        logger.error('Erreur lors de la vérification de la participation:', error);
        next(error);
    }
};

/**
 * Middleware de vérification du nombre de questions
 */
const verifierNombreQuestions = async (req, res, next) => {
    try {
        const { questions } = req.body;
        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: 'Les questions doivent être un tableau'
            });
        }

        if (questions.length < 1) {
            return res.status(400).json({
                success: false,
                message: 'Le quiz doit contenir au moins une question'
            });
        }

        if (questions.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'Le quiz ne peut pas contenir plus de 50 questions'
            });
        }

        next();
    } catch (error) {
        logger.error('Erreur lors de la vérification du nombre de questions:', error);
        next(error);
    }
};

/**
 * Middleware de vérification des réponses
 */
const verifierReponses = async (req, res, next) => {
    try {
        const { reponses } = req.body;
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz non trouvé'
            });
        }

        if (!reponses || !Array.isArray(reponses)) {
            return res.status(400).json({
                success: false,
                message: 'Les réponses doivent être un tableau'
            });
        }

        if (reponses.length !== quiz.questions.length) {
            return res.status(400).json({
                success: false,
                message: 'Le nombre de réponses ne correspond pas au nombre de questions'
            });
        }

        req.quiz = quiz;
        next();
    } catch (error) {
        logger.error('Erreur lors de la vérification des réponses:', error);
        next(error);
    }
};

module.exports = {
    validateCreation,
    validateMiseAJour,
    validateSoumissionReponses,
    verifierProprietaire,
    verifierAcces,
    verifierParticipation,
    verifierNombreQuestions,
    verifierReponses
}; 