/**
 * Resolvers GraphQL pour les evaluations
 *
 * @module graphql/resolvers/evaluation
 * @created 2025-05-31
 */

'use strict';

const mongoose = require('mongoose');
const Evaluation = require('../../models/evaluation.model');
const logger = require('../../utils/logger');
const { mapProjetMongoVersGraphQL } = require('./projet.resolver');
const { checkAuthorization } = require('../../utils/auth.utils');
const { AppError, ERROR_CODES } = require('../../middlewares/errorHandlers');

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
            note: doc.note,
            commentaire: doc.commentaire,
            criteres: doc.criteres,
            projet: doc.projetId,
            evaluateur: doc.evaluateurId,
            dateEvaluation: doc.dateEvaluation,
            creeLe: doc.creeLe,
            majLe: doc.majLe,
        };
    } catch (error) {
        logger.error('Error mapping evaluation:', {
            error: error.message,
            docId: doc?._id,
        });
        return null;
    }
}

const Query = {
    evaluations: async (_, { projetId }, context) => {
        checkAuthorization(context, 'read', 'evaluations');
        try {
            const filter = {};
            if (projetId) {
                filter.projetId = projetId;
            }
            const evaluations = await Evaluation.find(filter)
                .populate('projetId')
                .populate('evaluateurId');
            return evaluations.map(mapEvaluationMongoVersGraphQL);
        } catch (error) {
            logger.error('Error fetching evaluations:', error);
            throw new Error('Failed to fetch evaluations');
        }
    },

    evaluation: async (_, { id }, context) => {
        checkAuthorization(context, 'read', 'evaluations');
        try {
            const evaluation = await Evaluation.findById(id)
                .populate('projetId')
                .populate('evaluateurId');
            if (!evaluation) throw new Error('Evaluation not found');
            return mapEvaluationMongoVersGraphQL(evaluation);
        } catch (error) {
            logger.error('Error fetching evaluation:', error);
            throw new Error('Failed to fetch evaluation');
        }
    },

    getEvaluationStats: async (_, { projetId }, context) => {
        checkAuthorization(context, 'read', 'evaluations');

        try {
            // Validate projet ID
            if (!mongoose.Types.ObjectId.isValid(projetId)) {
                throw new AppError('Invalid projet ID', 400, ERROR_CODES.BAD_REQUEST, true);
            }

            const evaluations = await Evaluation.find({ projetId: projetId });

            if (evaluations.length === 0) {
                return {
                    moyenneScore: 0,
                    scoreMax: 0,
                    scoreMin: 0,
                    totalEvaluations: 0,
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
                totalEvaluations,
            };
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error('Error calculating evaluation stats:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                projetId,
            });

            throw new AppError(
                'Failed to calculate evaluation stats',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },
};

const Mutation = {
    creerEvaluation: async (_, { input }, context) => {
        checkAuthorization(context, 'create', 'evaluations');
        try {
            const evaluation = new Evaluation({
                ...input,
                evaluateurId: context.utilisateur?._id,
                dateEvaluation: new Date(),
            });
            await evaluation.save();
            return mapEvaluationMongoVersGraphQL(evaluation);
        } catch (error) {
            logger.error('Error creating evaluation:', error);
            throw new Error('Failed to create evaluation');
        }
    },

    mettreAJourEvaluation: async (_, { id, input }, context) => {
        checkAuthorization(context, 'update', 'evaluations');
        try {
            const evaluation = await Evaluation.findByIdAndUpdate(
                id,
                { ...input, majLe: new Date() },
                { new: true }
            );
            if (!evaluation) throw new Error('Evaluation not found');
            return mapEvaluationMongoVersGraphQL(evaluation);
        } catch (error) {
            logger.error('Error updating evaluation:', error);
            throw new Error('Failed to update evaluation');
        }
    },

    supprimerEvaluation: async (_, { id }, context) => {
        checkAuthorization(context, 'delete', 'evaluations');
        try {
            const evaluation = await Evaluation.findByIdAndDelete(id);
            if (!evaluation) throw new Error('Evaluation not found');
            return mapEvaluationMongoVersGraphQL(evaluation);
        } catch (error) {
            logger.error('Error deleting evaluation:', error);
            throw new Error('Failed to delete evaluation');
        }
    },
};

const EvaluationResolver = {
    id: parent => parent._id.toString(),
    projet: async (parent, _, context) => {
        try {
            if (!parent.projetId) return null;
            const projet = await context.loaders.projetLoader.load(parent.projetId.toString());
            return projet;
        } catch (error) {
            logger.error(`Error loading projet for evaluation ${parent.id}:`, error);
            return null;
        }
    },
    evaluateur: async (parent, _, context) => {
        try {
            if (!parent.evaluateurId) return null;
            const utilisateur = await context.loaders.utilisateurLoader.load(
                parent.evaluateurId.toString()
            );
            return utilisateur;
        } catch (error) {
            logger.error(`Error loading evaluator for evaluation ${parent.id}:`, error);
            return null;
        }
    },
};

module.exports = {
    Query,
    Mutation,
    Evaluation: EvaluationResolver,
};
