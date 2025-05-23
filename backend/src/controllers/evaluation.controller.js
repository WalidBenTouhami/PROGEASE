const Evaluation = require('../models/evaluation.model');
const Project = require('../models/project.model');
const { generateAIAnalysis } = require('../services/ai.service');

// Create a new evaluation
exports.createEvaluation = async (req, res) => {
    try {
        const { projectId, evaluatorId, score, comments, criteria } = req.body;

        // Validate project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
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
            project,
            score: finalScore,
            criteria
        });

        const evaluation = new Evaluation({
            projectId,
            evaluatorId,
            score: finalScore,
            comments,
            criteria,
            aiRecommendations: aiAnalysis
        });

        await evaluation.save();

        // Update project's average score
        const projectEvaluations = await Evaluation.find({ projectId });
        const averageScore = projectEvaluations.reduce((sum, eval) => sum + eval.score, 0) / projectEvaluations.length;
        await Project.findByIdAndUpdate(projectId, { averageScore });

        res.status(201).json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all evaluations with filtering
exports.getEvaluations = async (req, res) => {
    try {
        const {
            projectId,
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
        if (projectId) filter.projectId = projectId;
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
            .populate('projectId', 'titre description')
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
exports.getEvaluationById = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id)
            .populate('projectId', 'titre description')
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
exports.updateEvaluation = async (req, res) => {
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
        const project = await Project.findById(evaluation.projectId);
        const aiAnalysis = await generateAIAnalysis({
            project,
            score: finalScore,
            criteria
        });

        evaluation.score = finalScore;
        evaluation.comments = comments;
        evaluation.criteria = criteria;
        evaluation.aiRecommendations = aiAnalysis;

        await evaluation.save();

        // Update project's average score
        const projectEvaluations = await Evaluation.find({ projectId: evaluation.projectId });
        const averageScore = projectEvaluations.reduce((sum, eval) => sum + eval.score, 0) / projectEvaluations.length;
        await Project.findByIdAndUpdate(evaluation.projectId, { averageScore });

        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete evaluation
exports.deleteEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id);
        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        await Evaluation.deleteOne({ _id: evaluation._id });

        // Update project's average score
        const projectEvaluations = await Evaluation.find({ projectId: evaluation.projectId });
        const averageScore = projectEvaluations.length > 0
            ? projectEvaluations.reduce((sum, eval) => sum + eval.score, 0) / projectEvaluations.length
            : 0;
        await Project.findByIdAndUpdate(evaluation.projectId, { averageScore });

        res.json({ message: 'Evaluation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get evaluation statistics
exports.getEvaluationStats = async (req, res) => {
    try {
        const { projectId } = req.query;
        const filter = projectId ? { projectId } : {};

        const stats = await Evaluation.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: '$score' },
                    highestScore: { $max: '$score' },
                    lowestScore: { $min: '$score' },
                    totalEvaluations: { $sum: 1 }
                }
            }
        ]);

        res.json(stats[0] || {
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            totalEvaluations: 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 