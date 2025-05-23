const Project = require('../models/project.model');
const Deliverable = require('../models/deliverable.model');
const Evaluation = require('../models/evaluation.model');
const User = require('../models/user.model');
const { generateAIAnalysis, predictPerformance, generateLearningRecommendations } = require('../services/ai.service');

const transformId = (obj) => {
    if (!obj) return null;
    const transformed = obj.toObject ? obj.toObject() : { ...obj };
    return {
        ...transformed,
        id: transformed._id.toString()
    };
};

const resolvers = {
    Query: {
        // Project queries
        projects: async () => {
            try {
                return await Project.find()
                    .populate('team')
                    .populate('tutor')
                    .populate('deliverables')
                    .populate('evaluations');
            } catch (error) {
                throw new Error('Failed to fetch projects: ' + error.message);
            }
        },

        project: async (_, { id }) => {
            try {
                const project = await Project.findById(id)
                    .populate('team')
                    .populate('tutor')
                    .populate('deliverables')
                    .populate('evaluations');
                if (!project) {
                    throw new Error('Project not found');
                }
                return project;
            } catch (error) {
                throw new Error('Failed to fetch project: ' + error.message);
            }
        },

        getProjectProgress: async (_, { id }) => {
            try {
                const project = await Project.findById(id);
                if (!project) {
                    throw new Error('Project not found');
                }
                return project.progression || 0;
            } catch (error) {
                throw new Error('Failed to get project progress: ' + error.message);
            }
        },

        getPredictedPerformance: async (_, { id }) => {
            try {
                const project = await Project.findById(id);
                if (!project) {
                    throw new Error('Project not found');
                }
                return project.predictedPerformance || 0;
            } catch (error) {
                throw new Error('Failed to get predicted performance: ' + error.message);
            }
        },

        // Deliverable queries
        deliverables: async (_, { projectId }) => {
            try {
                return await Deliverable.find({ projectId }).populate('project');
            } catch (error) {
                throw new Error('Failed to fetch deliverables: ' + error.message);
            }
        },

        deliverable: async (_, { id }) => {
            try {
                const deliverable = await Deliverable.findById(id).populate('project');
                if (!deliverable) {
                    throw new Error('Deliverable not found');
                }
                return deliverable;
            } catch (error) {
                throw new Error('Failed to fetch deliverable: ' + error.message);
            }
        },

        // Evaluation queries
        evaluations: async (_, { projectId }) => {
            try {
                const query = projectId === "ALL" ? {} : { projectId };
                const evaluations = await Evaluation.find(query)
                    .populate('projectId')
                    .populate('evaluatorId');

                return evaluations.map(evaluation => {
                    const evalObj = evaluation.toObject();
                    return {
                        id: evalObj._id.toString(),
                        projectId: evalObj.projectId._id.toString(),
                        evaluatorId: evalObj.evaluatorId._id.toString(),
                        score: evalObj.score,
                        comments: evalObj.comments,
                        criteria: evalObj.criteria,
                        aiRecommendations: evalObj.aiRecommendations,
                        createdAt: evalObj.createdAt,
                        updatedAt: evalObj.updatedAt,
                        project: {
                            id: evalObj.projectId._id.toString(),
                            title: evalObj.projectId.title
                        },
                        evaluator: {
                            id: evalObj.evaluatorId._id.toString(),
                            nom: evalObj.evaluatorId.nom,
                            prenom: evalObj.evaluatorId.prenom
                        }
                    };
                });
            } catch (error) {
                throw new Error('Failed to fetch evaluations: ' + error.message);
            }
        },

        evaluation: async (_, { id }) => {
            try {
                const evaluation = await Evaluation.findById(id)
                    .populate('projectId')
                    .populate('evaluatorId');

                if (!evaluation) {
                    throw new Error('Evaluation not found');
                }

                const evalObj = evaluation.toObject();
                return {
                    id: evalObj._id.toString(),
                    projectId: evalObj.projectId._id.toString(),
                    evaluatorId: evalObj.evaluatorId._id.toString(),
                    score: evalObj.score,
                    comments: evalObj.comments,
                    criteria: evalObj.criteria,
                    aiRecommendations: evalObj.aiRecommendations,
                    createdAt: evalObj.createdAt,
                    updatedAt: evalObj.updatedAt,
                    project: {
                        id: evalObj.projectId._id.toString(),
                        title: evalObj.projectId.title
                    },
                    evaluator: {
                        id: evalObj.evaluatorId._id.toString(),
                        nom: evalObj.evaluatorId.nom,
                        prenom: evalObj.evaluatorId.prenom
                    }
                };
            } catch (error) {
                throw new Error('Failed to fetch evaluation: ' + error.message);
            }
        },

        getEvaluationStats: async (_, { projectId }) => {
            try {
                const stats = await Evaluation.aggregate([
                    { $match: { projectId } },
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

                return stats[0] || {
                    averageScore: 0,
                    highestScore: 0,
                    lowestScore: 0,
                    totalEvaluations: 0
                };
            } catch (error) {
                throw new Error('Failed to get evaluation stats: ' + error.message);
            }
        },

        // User queries
        users: async () => {
            try {
                return await User.find();
            } catch (error) {
                throw new Error('Failed to fetch users: ' + error.message);
            }
        },

        user: async (_, { id }) => {
            try {
                const user = await User.findById(id);
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            } catch (error) {
                throw new Error('Failed to fetch user: ' + error.message);
            }
        }
    },

    Mutation: {
        // Project mutations
        createProject: async (_, { input }) => {
            try {
                const project = new Project(input);
                await project.save();
                return project;
            } catch (error) {
                throw new Error('Failed to create project: ' + error.message);
            }
        },

        updateProject: async (_, { id, input }) => {
            try {
                const project = await Project.findByIdAndUpdate(
                    id,
                    { ...input, updatedAt: new Date() },
                    { new: true }
                );
                if (!project) {
                    throw new Error('Project not found');
                }
                return project;
            } catch (error) {
                throw new Error('Failed to update project: ' + error.message);
            }
        },

        deleteProject: async (_, { id }) => {
            try {
                const project = await Project.findByIdAndDelete(id);
                if (!project) {
                    throw new Error('Project not found');
                }
                return project;
            } catch (error) {
                throw new Error('Failed to delete project: ' + error.message);
            }
        },

        // Deliverable mutations
        addDeliverable: async (_, { projectId, input }) => {
            try {
                const project = await Project.findById(projectId);
                if (!project) {
                    throw new Error('Project not found');
                }

                const deliverable = new Deliverable({
                    ...input,
                    projectId
                });
                await deliverable.save();

                project.deliverables.push(deliverable._id);
                await project.save();

                return project;
            } catch (error) {
                throw new Error('Failed to add deliverable: ' + error.message);
            }
        },

        updateDeliverable: async (_, { id, input }) => {
            try {
                const deliverable = await Deliverable.findByIdAndUpdate(
                    id,
                    { ...input, updatedAt: new Date() },
                    { new: true }
                );
                if (!deliverable) {
                    throw new Error('Deliverable not found');
                }
                return deliverable;
            } catch (error) {
                throw new Error('Failed to update deliverable: ' + error.message);
            }
        },

        deleteDeliverable: async (_, { id }) => {
            try {
                const deliverable = await Deliverable.findById(id);
                if (!deliverable) {
                    throw new Error('Deliverable not found');
                }

                // Remove deliverable reference from project
                await Project.findByIdAndUpdate(
                    deliverable.projectId,
                    { $pull: { deliverables: id } }
                );

                await Deliverable.findByIdAndDelete(id);
                return deliverable;
            } catch (error) {
                throw new Error('Failed to delete deliverable: ' + error.message);
            }
        },

        // Evaluation mutations
        createEvaluation: async (_, { input }) => {
            try {
                const evaluation = new Evaluation(input);
                await evaluation.save();

                // Add evaluation reference to project
                await Project.findByIdAndUpdate(
                    input.projectId,
                    { $push: { evaluations: evaluation._id } }
                );

                return evaluation;
            } catch (error) {
                throw new Error('Failed to create evaluation: ' + error.message);
            }
        },

        updateEvaluation: async (_, { id, input }) => {
            try {
                const evaluation = await Evaluation.findByIdAndUpdate(
                    id,
                    { ...input, updatedAt: new Date() },
                    { new: true }
                );
                if (!evaluation) {
                    throw new Error('Evaluation not found');
                }
                return evaluation;
            } catch (error) {
                throw new Error('Failed to update evaluation: ' + error.message);
            }
        },

        deleteEvaluation: async (_, { id }) => {
            try {
                const evaluation = await Evaluation.findById(id);
                if (!evaluation) {
                    throw new Error('Evaluation not found');
                }

                // Remove evaluation reference from project
                await Project.findByIdAndUpdate(
                    evaluation.projectId,
                    { $pull: { evaluations: id } }
                );

                await Evaluation.findByIdAndDelete(id);
                return evaluation;
            } catch (error) {
                throw new Error('Failed to delete evaluation: ' + error.message);
            }
        },

        // AI-powered mutations
        predictPerformance: async (_, { projectId }) => {
            try {
                const project = await Project.findById(projectId)
                    .populate('deliverables')
                    .populate('evaluations');
                if (!project) {
                    throw new Error('Project not found');
                }

                const performance = await predictPerformance(project);
                project.predictedPerformance = performance;
                await project.save();

                return performance;
            } catch (error) {
                throw new Error('Failed to predict performance: ' + error.message);
            }
        },

        generateLearningRecommendations: async (_, { projectId }) => {
            try {
                const project = await Project.findById(projectId)
                    .populate('deliverables')
                    .populate('evaluations');
                if (!project) {
                    throw new Error('Project not found');
                }

                return await generateLearningRecommendations(project);
            } catch (error) {
                throw new Error('Failed to generate recommendations: ' + error.message);
            }
        }
    },

    // Remove the field resolvers since we're handling the transformation in the queries
    Evaluation: {}
};

module.exports = { resolvers };