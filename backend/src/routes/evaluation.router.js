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

router.get('/', evaluationController.getEvaluations);
router.get('/stats', evaluationController.getEvaluationStats);
router.get('/:id', evaluationController.getEvaluationById);

router.put('/:id', validateRequest(evaluationSchema), evaluationController.updateEvaluation);

router.delete('/:id', evaluationController.deleteEvaluation);

module.exports = router;
