const Evaluation = require('../models/evaluation.model');
const Projet = require('../models/projet.model');
const { generateAIAnalysis } = require('../services/ai.service');

// Create a new evaluation
const createEvaluation = async (req, res) => {
    try {
        const { projetId, evaluatorId, score, comments, criteria } = req.body;

        // Validate projet exists
        const projet = await Projet.findById(projetId);
        if (!projet) {
            return res.status(404).json({ message: 'Projet not found' });
        }

        // Calculate weighted score if criteria is provided
        let finalScore = score;
        if (criteria && criteria.length > 0) {
            finalScore = criteria.reduce((total, criterion) => {
                return total + (criterion.score * criterion.weight);
            }, 0);
        }

        // Generate AI analysis
        const aiAnalysis = await generateAIAnalysis({
            projet,
            score: finalScore,
            criteria
        });

        const evaluation = new Evaluation({
            projetId,
            evaluatorId,
            score: finalScore,
            comments,
            criteria,
            aiRecommendations: aiAnalysis
        });

        await evaluation.save();

        // Update projet's average score
        const projetEvaluations = await Evaluation.find({ projetId });
        const averageScore = projetEvaluations.reduce((sum, eval) => sum + eval.score, 0) / projetEvaluations.length;
        await Projet.findByIdAndUpdate(projetId, { averageScore });

        res.status(201).json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all evaluations with filtering
const getEvaluations = async (req, res) => {
    try {
        const {
            projetId,
            evaluatorId,
            minScore,
            maxScore,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Build filter object
        const filter = {};
        if (projetId) filter.projetId = projetId;
        if (evaluatorId) filter.evaluatorId = evaluatorId;
        if (minScore || maxScore) {
            filter.score = {};
            if (minScore) filter.score.$gte = Number(minScore);
            if (maxScore) filter.score.$lte = Number(maxScore);
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query with pagination and sorting
        const evaluations = await Evaluation.find(filter)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('projetId', 'titre description')
            .populate('evaluatorId', 'name email');

        // Get total count for pagination
        const total = await Evaluation.countDocuments(filter);

        res.json({
            evaluations,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get evaluation by ID
const getEvaluationById = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id)
            .populate('projetId', 'titre description')
            .populate('evaluatorId', 'name email');

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update evaluation
const updateEvaluation = async (req, res) => {
    try {
        const { score, comments, criteria } = req.body;

        // Calculate new weighted score if criteria is provided
        let finalScore = score;
        if (criteria && criteria.length > 0) {
            finalScore = criteria.reduce((total, criterion) => {
                return total + (criterion.score * criterion.weight);
            }, 0);
        }

        const evaluation = await Evaluation.findById(req.params.id);
        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        // Generate new AI analysis
        const projet = await Projet.findById(evaluation.projetId);
        const aiAnalysis = await generateAIAnalysis({
            projet,
            score: finalScore,
            criteria
        });

        evaluation.score = finalScore;
        evaluation.comments = comments;
        evaluation.criteria = criteria;
        evaluation.aiRecommendations = aiAnalysis;

        await evaluation.save();

        // Update projet's average score
        const projetEvaluations = await Evaluation.find({ projetId: evaluation.projetId });
        const averageScore = projetEvaluations.reduce((sum, eval) => sum + eval.score, 0) / projetEvaluations.length;
        await Projet.findByIdAndUpdate(evaluation.projetId, { averageScore });

        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete evaluation
const deleteEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id);
        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        await Evaluation.deleteOne({ _id: evaluation._id });

        // Update projet's average score
        const projetEvaluations = await Evaluation.find({ projetId: evaluation.projetId });
        const averageScore = projetEvaluations.length > 0
            ? projetEvaluations.reduce((sum, eval) => sum + eval.score, 0) / projetEvaluations.length
            : 0;
        await Projet.findByIdAndUpdate(evaluation.projetId, { averageScore });

        res.json({ message: 'Evaluation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get evaluation statistics
const getEvaluationStats = async (req, res) => {
    try {
        const stats = await Evaluation.aggregate([
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: "$score" },
                    minScore: { $min: "$score" },
                    maxScore: { $max: "$score" },
                    totalEvaluations: { $sum: 1 },
                    scoreDistribution: {
                        $push: "$score"
                    }
                }
            },
            {
                $projet: {
                    _id: 0,
                    averageScore: { $round: ["$averageScore", 2] },
                    minScore: 1,
                    maxScore: 1,
                    totalEvaluations: 1,
                    scoreDistribution: 1
                }
            }
        ]);

        // Calculate score distribution in ranges
        const distribution = stats[0]?.scoreDistribution || [];
        const ranges = {
            '0-5': 0,
            '6-10': 0,
            '11-15': 0,
            '16-20': 0
        };

        distribution.forEach(score => {
            if (score <= 5) ranges['0-5']++;
            else if (score <= 10) ranges['6-10']++;
            else if (score <= 15) ranges['11-15']++;
            else ranges['16-20']++;
        });

        const response = stats[0] ? {
            ...stats[0],
            scoreDistribution: ranges
        } : {
            averageScore: 0,
            minScore: 0,
            maxScore: 0,
            totalEvaluations: 0,
            scoreDistribution: ranges
        };

        res.status(200).json({
            status: 'success',
            data: response
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching evaluation statistics',
            error: error.message
        });
    }
};

module.exports = {
    createEvaluation,
    getEvaluations,
    getEvaluationById,
    updateEvaluation,
    deleteEvaluation,
    getEvaluationStats
}; 