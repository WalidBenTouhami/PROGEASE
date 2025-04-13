const Evaluation = require('../models/Evaluation');

class EvaluationService {
    // Get all evaluations with pagination and filtering
    async getEvaluations(filters = {}, pagination = { page: 1, limit: 10 }) {
        const { minNote, maxNote, sort } = filters;
        const { page, limit } = pagination;

        let query = Evaluation.find();

        if (minNote) {
            query = query.where('note').gte(minNote);
        }
        if (maxNote) {
            query = query.where('note').lte(maxNote);
        }
        if (sort) {
            query = query.sort(sort);
        }

        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(parseInt(limit));

        const [evaluations, total] = await Promise.all([
            query
                .populate('projetId', 'titre dateDebut dateFin statut')
                .populate('etudiantId', 'nom email')
                .populate('equipeId', 'equipeId membres')
                .populate('tuteurId', 'nom email'),
            Evaluation.countDocuments()
        ]);

        return {
            evaluations,
            pagination: {
                page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                total
            }
        };
    }

    // Get a single evaluation by ID
    async getEvaluationById(id) {
        return await Evaluation.findById(id)
            .populate('projetId', 'titre description')
            .populate('etudiantId', 'nom email')
            .populate('equipeId', 'equipeId membres')
            .populate('tuteurId', 'nom email')
            .populate('historique.modifiePar', 'nom email');
    }

    // Create a new evaluation
    async createEvaluation(evaluationData) {
        return await Evaluation.create(evaluationData);
    }

    // Update an evaluation
    async updateEvaluation(id, evaluationData) {
        const evaluation = await Evaluation.findById(id);
        if (!evaluation) {
            throw new Error('Evaluation non trouvée');
        }

        // Add to history
        evaluation.historique.push({
            note: evaluation.note,
            commentaires: evaluation.commentaires,
            modifiePar: evaluationData.modifiePar,
            dateModification: new Date()
        });

        return await Evaluation.findByIdAndUpdate(
            id,
            { ...evaluationData, $push: { historique: evaluation.historique[evaluation.historique.length - 1] } },
            { new: true, runValidators: true }
        ).populate('historique.modifiePar', 'nom email');
    }

    // Delete an evaluation
    async deleteEvaluation(id) {
        const evaluation = await Evaluation.findByIdAndDelete(id);
        if (!evaluation) {
            throw new Error('Evaluation non trouvée');
        }
        return evaluation;
    }

    // Get evaluations by project
    async getEvaluationsByProject(projectId) {
        return await Evaluation.find({ projetId: projectId })
            .populate('etudiantId', 'nom email')
            .populate('equipeId', 'equipeId membres')
            .populate('tuteurId', 'nom email');
    }

    // Get evaluations by student
    async getEvaluationsByStudent(studentId) {
        return await Evaluation.find({ etudiantId: studentId })
            .populate('projetId', 'titre dateDebut dateFin statut')
            .populate('tuteurId', 'nom email');
    }

    // Get evaluations by team
    async getEvaluationsByTeam(teamId) {
        return await Evaluation.find({ equipeId: teamId })
            .populate('projetId', 'titre dateDebut dateFin statut')
            .populate('tuteurId', 'nom email');
    }

    // Get evaluation statistics
    async getStatistics() {
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
            return {
                moyenneGenerale: 0,
                noteMaximum: 0,
                noteMinimum: 0,
                nombreEvaluations: 0
            };
        }

        return stats[0];
    }
}

module.exports = new EvaluationService(); 