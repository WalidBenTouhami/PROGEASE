/**
 * Resolvers GraphQL pour les evaluations
 *
 * @module graphql/resolvers/evaluation
 * @created 2025-05-31
 */

'use strict';

const mongoose = require('mongoose');
const Evaluation = require('../../models/evaluation.model');
const Projet = require('../../models/projet.model');
const logger = require('../../utils/logger');
const { AppError, ERROR_CODES } = require('../../middleware/errorHandlers');
const { validateInput } = require('../../utils/validators');
const { handleMongooseError } = require('../../utils/errorUtils');
const { checkAuthorization } = require('../../utils/auth.utils');
const { mapProjetMongoVersGraphQL } = require('./projet.resolver');

/**
 * Transforme un document MongoDB Evaluation en type GraphQL
 * @param {mongoose.Document} doc - Document MongoDB
 * @returns {Object|null} - Objet formate pour GraphQL
 */
function mapEvaluationMongoVersGraphQL(doc) {
    if (!doc) return null;
    try {
        return {
            id: doc._id.toString(),
            projetId: doc.projetId?.toString(),
            evaluateurId: doc.evaluateurId?.toString(),
            score: doc.score,
            commentaires: doc.commentaires,
            criteres: doc.criteres.map(c => ({
                nom: c.nom,
                score: c.score,
                poids: c.poids
            })),
            aiRecommendations: doc.aiRecommendations,
            creeLe: doc.creeLe,
            majLe: doc.majLe
        };
    } catch (error) {
        logger.error('Error mapping evaluation:', {
            error: error.message,
            docId: doc?._id
        });
        return null;
    }
}

const Query = {
    evaluations: async (_, { projectId }, context) => {
        checkAuthorization(context, 'read', 'evaluations');

        try {
            // Validate project ID
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                throw new AppError(
                    'Invalid project ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            const evaluations = await Evaluation.find({ projetId: projectId })
                .populate('evaluateurId', 'nom prenom email')
                .sort({ majLe: -1 });

            return evaluations.map(mapEvaluationMongoVersGraphQL);
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error('Error fetching evaluations:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                projectId
            });

            throw new AppError(
                'Failed to fetch evaluations',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    evaluation: async (_, { id }, context) => {
        checkAuthorization(context, 'read', 'evaluations');

        try {
            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'Invalid evaluation ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            const evaluation = await Evaluation.findById(id)
                .populate('evaluateurId', 'nom prenom email')
                .populate('projetId');

            if (!evaluation) {
                throw new AppError(
                    'Evaluation not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            return mapEvaluationMongoVersGraphQL(evaluation);
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error(`Error fetching evaluation ${id}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Failed to fetch evaluation',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    getEvaluationStats: async (_, { projectId }, context) => {
        checkAuthorization(context, 'read', 'evaluations');

        try {
            // Validate project ID
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                throw new AppError(
                    'Invalid project ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            const evaluations = await Evaluation.find({ projetId: projectId });

            if (evaluations.length === 0) {
                return {
                    moyenneScore: 0,
                    scoreMax: 0,
                    scoreMin: 0,
                    totalEvaluations: 0
                };
            }

            const scores = evaluations.map(e => e.score);
            const totalEvaluations = scores.length;
            const moyenneScore = scores.reduce((a, b) => a + b, 0) / totalEvaluations;
            const scoreMax = Math.max(...scores);
            const scoreMin = Math.min(...scores);

            return {
                moyenneScore,
                scoreMax,
                scoreMin,
                totalEvaluations
            };
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error('Error calculating evaluation stats:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                projectId
            });

            throw new AppError(
                'Failed to calculate evaluation stats',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    }
};

const Mutation = {
    createEvaluation: async (_, { input }, context) => {
        checkAuthorization(context, 'create', 'evaluations');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Validate input
            validateInput(input, {
                projetId: { required: true, type: 'string' },
                evaluateurId: { required: true, type: 'string' },
                score: { required: true, type: 'number', min: 0, max: 100 },
                commentaires: { type: 'string' },
                criteres: {
                    type: 'array',
                    itemType: 'object',
                    required: true,
                    validate: (criteres) => {
                        if (!criteres.every(c => c.nom && typeof c.score === 'number' && typeof c.poids === 'number')) {
                            throw new Error('Invalid criteria format');
                        }
                        const totalPoids = criteres.reduce((sum, c) => sum + c.poids, 0);
                        if (Math.abs(totalPoids - 1) > 0.001) {
                            throw new Error('Criteria weights must sum to 1');
                        }
                    }
                }
            });

            // Check if project exists
            const projet = await Projet.findById(input.projetId).session(session);
            if (!projet) {
                throw new AppError(
                    'Project not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Create evaluation
            const evaluation = new Evaluation({
                ...input,
                createur: context.user?._id,
                creeLe: new Date(),
                majLe: new Date()
            });

            const saved = await evaluation.save({ session });

            // Update project
            projet.evaluations.push(saved._id);
            await projet.save({ session });

            await session.commitTransaction();

            // Invalidate DataLoader caches
            context.loaders.evaluationLoader?.clear(saved._id);
            context.loaders.projetLoader?.clear(input.projetId);

            logger.info(`Evaluation created: ${saved._id}`, {
                userId: context.user?._id,
                projectId: input.projetId,
                requestId: context.requestId
            });

            return mapEvaluationMongoVersGraphQL(saved);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            const appError = handleMongooseError(
                error,
                'Failed to create evaluation',
                context.requestId
            );

            logger.error('Error creating evaluation:', {
                error: error.message,
                stack: error.stack,
                input,
                requestId: context.requestId
            });

            throw appError;
        } finally {
            await session.endSession();
        }
    },

    updateEvaluation: async (_, { id, input }, context) => {
        checkAuthorization(context, 'update', 'evaluations');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'Invalid evaluation ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Validate input
            if (input.score !== undefined) {
                validateInput({ score: input.score }, { score: { type: 'number', min: 0, max: 100 } });
            }
            if (input.criteres) {
                validateInput({ criteres: input.criteres }, {
                    criteres: {
                        type: 'array',
                        itemType: 'object',
                        validate: (criteres) => {
                            if (!criteres.every(c => c.nom && typeof c.score === 'number' && typeof c.poids === 'number')) {
                                throw new Error('Invalid criteria format');
                            }
                            const totalPoids = criteres.reduce((sum, c) => sum + c.poids, 0);
                            if (Math.abs(totalPoids - 1) > 0.001) {
                                throw new Error('Criteria weights must sum to 1');
                            }
                        }
                    }
                });
            }

            const updateData = {
                ...input,
                majLe: new Date(),
                majPar: context.user?._id
            };

            const evaluation = await Evaluation.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true,
                    session
                }
            ).populate('evaluateurId', 'nom prenom email')
                .populate('projetId');

            if (!evaluation) {
                throw new AppError(
                    'Evaluation not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            await session.commitTransaction();

            // Invalidate DataLoader caches
            context.loaders.evaluationLoader?.clear(id);
            context.loaders.projetLoader?.clear(evaluation.projetId);

            logger.info(`Evaluation updated: ${id}`, {
                userId: context.user?._id,
                projectId: evaluation.projetId,
                requestId: context.requestId
            });

            return mapEvaluationMongoVersGraphQL(evaluation);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            const appError = handleMongooseError(
                error,
                'Failed to update evaluation',
                context.requestId
            );

            logger.error(`Error updating evaluation ${id}:`, {
                error: error.message,
                stack: error.stack,
                input,
                requestId: context.requestId
            });

            throw appError;
        } finally {
            await session.endSession();
        }
    },

    deleteEvaluation: async (_, { id }, context) => {
        checkAuthorization(context, 'delete', 'evaluations');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'Invalid evaluation ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            const evaluation = await Evaluation.findByIdAndDelete(id).session(session);

            if (!evaluation) {
                throw new AppError(
                    'Evaluation not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Update parent project
            const projet = await Projet.findById(evaluation.projetId).session(session);
            if (projet) {
                projet.evaluations = projet.evaluations.filter(eId => eId.toString() !== id);
                await projet.save({ session });
            }

            await session.commitTransaction();

            // Invalidate DataLoader caches
            context.loaders.evaluationLoader?.clear(id);
            context.loaders.projetLoader?.clear(evaluation.projetId);

            logger.info(`Evaluation deleted: ${id}`, {
                userId: context.user?._id,
                projectId: evaluation.projetId,
                requestId: context.requestId
            });

            return mapEvaluationMongoVersGraphQL(evaluation);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            logger.error(`Error deleting evaluation ${id}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Failed to delete evaluation',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        } finally {
            await session.endSession();
        }
    }
};

const EvaluationResolver = {
    projet: async (parent, _, context) => {
        if (!parent.projetId) return null;
        try {
            const projet = await context.loaders.projetLoader.load(parent.projetId);
            return mapProjetMongoVersGraphQL(projet);
        } catch (error) {
            logger.error(`Error loading project for evaluation ${parent.id}:`, error);
            return null;
        }
    },
    evaluateur: async (parent, _, context) => {
        if (!parent.evaluateurId) return null;
        try {
            return await context.loaders.userLoader.load(parent.evaluateurId);
        } catch (error) {
            logger.error(`Error loading evaluator for evaluation ${parent.id}:`, error);
            return null;
        }
    }
};

module.exports = {
    Query,
    Mutation,
    Evaluation: EvaluationResolver,
    mapEvaluationMongoVersGraphQL
}; 