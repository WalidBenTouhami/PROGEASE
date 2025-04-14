// src/modules/evaluation-system/controllers/evaluation.controller.js

import { EvaluationService } from '../services/evaluation.service.js';
import { HTTP_STATUS } from '../../../config/constants.js';




export class EvaluationController {
    static async createEvaluation(req, res) {
        try {
            const evaluation = await EvaluationService.createEvaluation({
                ...req.body,
                evaluatorId: req.user.id
            });
            res.status(HTTP_STATUS.CREATED).json(evaluation);
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                code: 'EVALUATION_CREATION_FAILED',
                message: ERROR_MESSAGES.EVALUATION.CREATION_FAILED
            });
        }
    }

    static async getEvaluationReport(req, res) {
        try {
            const report = await EvaluationService.generateReport(req.params.projectId);
            res.status(HTTP_STATUS.OK).json(report);
        } catch (error) {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                error: ERROR_MESSAGES.GENERAL.NOT_FOUND
            });
        }
    }
}


