/**
     * Resolvers GraphQL pour les fonctionnalites d'intelligence artificielle
     *
     * @module graphql/resolvers/ai
     * @created 2025-05-28 par WalidBenTouhami
     */

'use strict';

const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const aiService = require('../../services/ai.service');
const Projet = require('../../models/projet.model');
const { AppError, ERROR_CODES } = require('../../middleware/errorHandlers');
const { checkAuthorization } = require('../../utils/auth.utils');

// Implementation temporaire des methodes manquantes du service
const mockAIService = {
    generateRecommendations: async (projet) => {
        return {
            text: [`Recommandation pour projet ${projet._id}`],
            score: 0.85,
            confidence: 0.9
        };
    },
    generateLearningRecommendations: async (project) => {
        return [`Recommandation d'apprentissage pour projet ${project._id}`];
    },
    predictPerformance: async (project) => {
        return {
            score: 0.75,
            confidence: 0.8,
            factors: ['Progression', 'Qualité des livrables']
        };
    }
};

// Use the imported aiService instead of undefined AIService
const aiServiceToUse = aiService || mockAIService;

const Query = {
    aiRecommendations: async (_, { projetId }, context) => {
        checkAuthorization(context, 'read', 'projets');
        
        try {
            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(projetId)) {
                throw new AppError(
                    'Invalid project ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            const projet = await Projet.findById(projetId)
                .populate('livrables')
                .populate('evaluations');

            if (!projet) {
                throw new AppError(
                    'Project not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            const startTime = Date.now();
            const recommendations = await aiServiceToUse.generateRecommendations(projet);
            const processingTime = (Date.now() - startTime) / 1000; // Convert to seconds

            return {
                recommendations: recommendations.text,
                score: recommendations.score,
                confidence: recommendations.confidence,
                metadata: {
                    modelUsed: 'DeepSeek-Coder',
                    timestamp: new Date(),
                    processingTime
                }
            };
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error('Error generating AI recommendations:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                projetId
            });

            throw new AppError(
                'Failed to generate AI recommendations',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    }
};

const Mutation = {
    generateLearningRecommendations: async (_, { projectId }, context) => {
        checkAuthorization(context, 'read', 'projets');

        try {
            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                throw new AppError(
                    'Invalid project ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            const project = await Projet.findById(projectId)
                .populate('livrables')
                .populate('evaluations');

            if (!project) {
                throw new AppError(
                    'Project not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            return await aiServiceToUse.generateLearningRecommendations(project);
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error('Error generating learning recommendations:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                projectId
            });

            throw new AppError(
                'Failed to generate learning recommendations',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    predictPerformance: async (_, { projectId }, context) => {
        checkAuthorization(context, 'read', 'projets');

        try {
            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                throw new AppError(
                    'Invalid project ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            const project = await Projet.findById(projectId)
                .populate('livrables')
                .populate('evaluations');

            if (!project) {
                throw new AppError(
                    'Project not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            const performance = await aiServiceToUse.predictPerformance(project);
            project.predictedPerformance = performance;
            await project.save();

            return performance;
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error('Error predicting performance:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                projectId
            });

            throw new AppError(
                'Failed to predict performance',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    }
};

module.exports = {
    Query,
    Mutation
};