import express from 'express';
import validationEvaluation from '../middlewares/validationEvaluation.js';
import {
    getEvaluations,
    getEvaluation,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    getByProjet,
    getByEtudiant,
    getByEquipe,
    getStatistiques
} from '../controllers/evaluationController.js';

import {
    analyserProgression,
    predirePerformance,
    analyserEquipe
} from '../controllers/aiController.js';

const router = express.Router();

router.route('/')
    .get(getEvaluations)
    .post(validationEvaluation, createEvaluation);

router.get('/statistiques', getStatistiques);

router.route('/:id')
    .get(getEvaluation)
    .put(validationEvaluation, updateEvaluation)
    .delete(deleteEvaluation);

router.get('/projet/:projetId', getByProjet);
router.get('/etudiant/:etudiantId', getByEtudiant);
router.get('/equipe/:equipeId', getByEquipe);

// Routes IA
router.get('/ai/progression/:etudiantId', analyserProgression);
router.get('/ai/prediction/:etudiantId', predirePerformance);
router.get('/ai/equipe/:equipeId', analyserEquipe);

export default router; 