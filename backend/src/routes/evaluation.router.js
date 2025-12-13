const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluation.controller');
const { validateRequest } = require('../middlewares/validateRequest');
const { evaluationSchema } = require('../validations/evaluation.validation');
const { rateLimiter } = require('../middlewares/rateLimiter');

// Apply rate limiting to evaluation routes
router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
router.post('/', validateRequest(evaluationSchema), evaluationController.createEvaluation);

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

router.put('/:id', validateRequest(evaluationSchema), evaluationController.updateEvaluation);

router.delete(
    '/:id',
    rateLimiter({ windowMs: 60000, max: 20 }),
    evaluationController.deleteEvaluation
);

module.exports = router;
