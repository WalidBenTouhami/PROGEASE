// src/modules/evaluation-system/middlewares/evaluation.middleware.js

import mongoose from 'mongoose';
import Evaluation from '../models/evaluation.model.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../../config/constants.js';

export const validateEvaluationInput = (req, res, next) => {
    const { criteria, projectId } = req.body;

    if (!criteria || !Object.keys(criteria).length) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            code: 'INVALID_CRITERIA',
            message: ERROR_MESSAGES.EVALUATION.INVALID_CRITERIA
        });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            code: 'INVALID_PROJECT',
            message: ERROR_MESSAGES.PROJECT.INVALID_ID
        });
    }

    next();
};

export const checkEvaluationOwnership = async (req, res, next) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id);

        if (!evaluation) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                code: 'EVALUATION_NOT_FOUND',
                message: ERROR_MESSAGES.EVALUATION.NOT_FOUND
            });
        }

        if (evaluation.evaluator.toString() !== req.user.id) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                code: 'UNAUTHORIZED_ACCESS',
                message: ERROR_MESSAGES.AUTH.UNAUTHORIZED
            });
        }

        req.evaluation = evaluation;
        next();
    } catch (error) {
        next(error);
    }
};