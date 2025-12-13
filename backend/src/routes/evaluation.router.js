const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluation.controller');
const { validateRequest } = require('../middlewares/validateRequest');
const { evaluationSchema } = require('../validations/evaluation.validation');
const { rateLimiter } = require('../middlewares/rateLimiter');

// Routes
router.post(
    '/',
    rateLimiter({ windowMs: 60000, max: 30 }),
    validateRequest(evaluationSchema),
    evaluationController.createEvaluation
);

router.get('/', rateLimiter({ windowMs: 60000, max: 50 }), evaluationController.getEvaluations);
router.get(
    '/stats',
    rateLimiter({ windowMs: 60000, max: 30 }),
    evaluationController.getEvaluationStats
);
router.get(
    '/:id',
    rateLimiter({ windowMs: 60000, max: 50 }),
    evaluationController.getEvaluationById
);

router.put(
    '/:id',
    rateLimiter({ windowMs: 60000, max: 30 }),
    validateRequest(evaluationSchema),
    evaluationController.updateEvaluation
);

router.delete(
    '/:id',
    rateLimiter({ windowMs: 60000, max: 20 }),
    evaluationController.deleteEvaluation
);

module.exports = router;
