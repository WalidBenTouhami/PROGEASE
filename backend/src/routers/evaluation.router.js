const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluation.controller');
const validateRequest = require('../middlewares/validate.Request');

// Validation middleware
const validateEvaluation = (req, res, next) => {
    const { score, criteria } = req.body;
    
    // Validate score
    if (score < 0 || score > 20) {
        return res.status(400).json({ message: 'Score must be between 0 and 20' });
    }

    // Validate criteria if provided
    if (criteria && Array.isArray(criteria)) {
        for (const criterion of criteria) {
            if (criterion.score < 0 || criterion.score > 20) {
                return res.status(400).json({ message: 'Criterion score must be between 0 and 20' });
            }
            if (criterion.weight < 0 || criterion.weight > 1) {
                return res.status(400).json({ message: 'Criterion weight must be between 0 and 1' });
            }
        }
    }

    next();
};

// Routes
router.post('/', validateRequest, validateEvaluation, evaluationController.createEvaluation);
router.get('/', validateRequest, evaluationController.getEvaluations);
router.get('/stats', validateRequest, evaluationController.getEvaluationStats);
router.get('/:id', validateRequest, evaluationController.getEvaluationById);
router.put('/:id', validateRequest, validateEvaluation, evaluationController.updateEvaluation);
router.delete('/:id', validateRequest, evaluationController.deleteEvaluation);

module.exports = router; 