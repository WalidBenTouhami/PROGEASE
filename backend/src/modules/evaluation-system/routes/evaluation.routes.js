// src/modules/evaluation-system/routes/evaluation.routes.js

import { Router } from 'express';
import { EvaluationController } from '../controllers/evaluation.controller.js';
import { validateEvaluationInput } from '../middlewares/evaluation.middleware.js';

const router = Router();

router.post('/projects/:projectId/evaluations',
    validateEvaluationInput,
    EvaluationController.createEvaluation
);

router.get('/projects/:projectId/report',
    EvaluationController.getEvaluationReport
);

export default router;