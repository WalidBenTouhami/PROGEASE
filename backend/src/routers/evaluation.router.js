// backend/src/routers/evaluation.router.js

const express = require('express');
const Evaluation = require('../models/evaluation.model');
const Project = require('../models/project.model');

const express = require('express');
const router = express.Router();

// Récupérer toutes les évaluations
router.get('/', async (req, res) => {
    try {
        const evaluations = await Evaluation.find().populate(['project', 'evaluator']).lean();
        res.status(200).json(evaluations);
    } catch (error) {
        res.status(500).json({ message: `Erreur lors de la récupération des évaluations : ${error.message}` });
    }
});

// Ajouter une nouvelle évaluation
router.post('/', async (req, res) => {
    try {
        const { project, evaluator, criteria, comments, attachments } = req.body;

        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        const newEvaluation = new Evaluation({ project, evaluator, criteria, comments, attachments });
        await newEvaluation.save();

        projectExists.evaluations.push(newEvaluation._id);
        await projectExists.save();

        res.status(201).json(newEvaluation);
    } catch (error) {
        res.status(500).json({ message: `Erreur lors de la création de l'évaluation : ${error.message}` });
    }
});

// Récupérer une évaluation par ID
router.get('/:id', async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id).populate(['project', 'evaluator']).lean();
        if (!evaluation) {
            return res.status(404).json({ message: 'Évaluation non trouvée' });
        }
        res.status(200).json(evaluation);
    } catch (error) {
        res.status(500).json({ message: `Erreur lors de la récupération de l'évaluation : ${error.message}` });
    }
});

// Supprimer une évaluation
router.delete('/:id', async (req, res) => {
    try {
        const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
        if (!evaluation) {
            return res.status(404).json({ message: 'Évaluation non trouvée' });
        }
        res.status(200).json({ message: 'Évaluation supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: `Erreur lors de la suppression de l'évaluation : ${error.message}` });
    }
});

module.exports = router;