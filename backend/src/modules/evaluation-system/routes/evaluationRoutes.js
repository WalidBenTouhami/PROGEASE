const express = require('express');
const router = express.Router();
const validationEvaluation = require('../middlewares/validationEvaluation');
const {
    getEvaluations,
    getEvaluation,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    getByProjet,
    getByEtudiant,
    getByEquipe,
    getStatistiques
} = require('../controllers/evaluationController');

const {
    analyserProgression,
    predirePerformance,
    analyserEquipe
} = require('../controllers/aiController');

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

router.get('/ai/progression/:etudiantId', analyserProgression);
router.get('/ai/prediction/:etudiantId', predirePerformance);
router.get('/ai/equipe/:equipeId', analyserEquipe);

module.exports = router; 