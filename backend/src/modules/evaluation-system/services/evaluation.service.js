// src/modules/evaluation-system/services/evaluation.service.js

import Evaluation from '../models/evaluation.model.js';

export class EvaluationService {
    static async createEvaluation(evaluationData) {
        return Evaluation.create(evaluationData);
    }

    static async getProjectEvaluations(projectId, page = 1, limit = 10) {
        return Evaluation.paginate(
            { project: projectId },
            {
                page,
                limit,
                populate: 'evaluator',
                sort: '-createdAt'
            }
        );
    }

    static async generateEvaluationReport(projectId) {
        const results = await Evaluation.aggregate([
            { $match: { project: projectId } },
            {
                $group: {
                    _id: null,
                    avgTechnical: { $avg: '$criteria.technical' },
                    avgCreativity: { $avg: '$criteria.creativity' },
                    avgPresentation: { $avg: '$criteria.presentation' },
                    count: { $sum: 1 }
                }
            }
        ]);

        return results[0] || {};
    }

    static async deleteEvaluation(evaluationId) {
        return Evaluation.findByIdAndDelete(evaluationId);
    }
}