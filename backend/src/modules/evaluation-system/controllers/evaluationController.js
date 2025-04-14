const Evaluation = require('../models/Evaluation');
const Projet = require('../models/Projet');

// @desc    Get all evaluations
// @route   GET /api/evaluations
exports.getEvaluations = async (req, res) => {
    try {
        const { minNote, maxNote, tri, page = 1, limite = 10 } = req.query;
        let query = Evaluation.find();

        if (minNote) {
            query = query.where('note').gte(minNote);
        }
        if (maxNote) {
            query = query.where('note').lte(maxNote);
        }
        if (tri) {
            query = query.sort(tri);
        }

        const skip = (page - 1) * limite;
        query = query.skip(skip).limit(parseInt(limite));

        const [evaluations, total] = await Promise.all([
            query
                .populate('projetId', 'titre dateDebut dateFin statut')
                .populate('etudiantId', 'nom email')
                .populate('equipeId', 'equipeId membres')
                .populate('tuteurId', 'nom email'),
            Evaluation.countDocuments()
        ]);

        res.status(200).json({
            evaluations,
            pagination: {
                page: parseInt(page),
                totalPages: Math.ceil(total / limite),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new evaluation
// @route   POST /api/evaluations
exports.createEvaluation = async (req, res) => {
    try {
        if ((!req.body.etudiantId && !req.body.equipeId) || (req.body.etudiantId && req.body.equipeId)) {
            return res.status(400).json({ 
                message: 'Il faut soit un ID étudiant soit un ID équipe, mais pas les deux' 
            });
        }

        const evaluation = await Evaluation.create(req.body);
        res.status(201).json(evaluation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get single evaluation
// @route   GET /api/evaluations/:id
exports.getEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id)
            .populate('projetId', 'titre description')
            .populate('etudiantId', 'nom email')
            .populate('equipeId', 'equipeId membres')
            .populate('tuteurId', 'nom email')
            .populate('historique.modifiePar', 'nom email');

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation non trouvée' });
        }
        res.status(200).json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update evaluation
// @route   PUT /api/evaluations/:id
exports.updateEvaluation = async (req, res) => {
    try {
        if ((!req.body.etudiantId && !req.body.equipeId) || (req.body.etudiantId && req.body.equipeId)) {
            return res.status(400).json({ 
                message: 'Il faut soit un ID étudiant soit un ID équipe, mais pas les deux' 
            });
        }

        const evaluation = await Evaluation.findById(req.params.id);
        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation non trouvée' });
        }

        // Ajouter l'entrée à l'historique
        evaluation.historique.push({
            note: evaluation.note,
            commentaires: evaluation.commentaires,
            modifiePar: req.body.modifiePar,
            dateModification: new Date()
        });

        // Mettre à jour l'évaluation
        const evaluationMiseAJour = await Evaluation.findByIdAndUpdate(
            req.params.id,
            { ...req.body, $push: { historique: evaluation.historique[evaluation.historique.length - 1] } },
            { new: true, runValidators: true }
        ).populate('historique.modifiePar', 'nom email');

        res.status(200).json(evaluationMiseAJour);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete evaluation
// @route   DELETE /api/evaluations/:id
exports.deleteEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation non trouvée' });
        }
        res.status(200).json({ message: 'Evaluation supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get evaluations by project
// @route   GET /api/evaluations/project/:projectId
exports.getByProjet = async (req, res) => {
    try {
        const evaluations = await Evaluation.find({ projetId: req.params.projetId })
            .populate('etudiantId', 'nom email')
            .populate('equipeId', 'equipeId membres')
            .populate('tuteurId', 'nom email');
        res.status(200).json(evaluations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get evaluations by student
// @route   GET /api/evaluations/student/:studentId
exports.getByEtudiant = async (req, res) => {
    try {
        const evaluations = await Evaluation.find({ etudiantId: req.params.etudiantId })
            .populate('projetId', 'titre dateDebut dateFin statut')
            .populate('tuteurId', 'nom email');
        res.status(200).json(evaluations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get evaluations by equipe
// @route   GET /api/evaluations/equipe/:equipeId
exports.getByEquipe = async (req, res) => {
    try {
        const evaluations = await Evaluation.find({ equipeId: req.params.equipeId })
            .populate('projetId', 'titre dateDebut dateFin statut')
            .populate('tuteurId', 'nom email');
        res.status(200).json(evaluations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStatistiques = async (req, res) => {
    try {
        const stats = await Evaluation.aggregate([
            {
                $group: {
                    _id: null,
                    moyenneGenerale: { $avg: '$note' },
                    noteMaximum: { $max: '$note' },
                    noteMinimum: { $min: '$note' },
                    nombreEvaluations: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    moyenneGenerale: { $round: ['$moyenneGenerale', 2] },
                    noteMaximum: 1,
                    noteMinimum: 1,
                    nombreEvaluations: 1
                }
            }
        ]);

        if (stats.length === 0) {
            return res.status(200).json({
                moyenneGenerale: 0,
                noteMaximum: 0,
                noteMinimum: 0,
                nombreEvaluations: 0
            });
        }

        res.status(200).json(stats[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 