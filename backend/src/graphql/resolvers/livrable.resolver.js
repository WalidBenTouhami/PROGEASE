/**
 * Resolvers GraphQL pour les livrables
 *
 * @module graphql/resolvers/livrable
 * @created 2025-05-27 par WalidBenTouhami
 */

'use strict';

const mongoose = require('mongoose');
const Livrable = require('../../models/livrable.model');
const Projet = require('../../models/projet.model');
const logger = require('../../utils/logger');
const { AppError, ERROR_CODES } = require('../../middleware/errorHandlers');
const { validateInput } = require('../../utils/validators');
const { handleMongooseError } = require('../../utils/errorUtils');
const { Enum } = require('../../../config/constants');
const { mapProjetMongoVersGraphQL } = require('./projet.resolver');
const { checkAuthorization } = require('../../utils/auth.utils');

/**
 * Transforme un document MongoDB Livrable en type GraphQL
 * @param {mongoose.Document} doc - Document MongoDB
 * @returns {Object|null} - Objet formate pour GraphQL
 */
function mapLivrableMongoVersGraphQL(doc) {
    if (!doc) return null;
    try {
        return {
            id: doc._id.toString(),
            intitule: doc.intitule || '',
            description: doc.description || '',
            dateLimite: doc.dateLimite || null,
            urlDepot: doc.urlDepot || '',
            statut: doc.statut || Enum.StatutLivrable.EN_ATTENTE,
            projetId: doc.projetId?.toString() || '',
            creeLe: doc.creeLe || new Date(),
            majLe: doc.majLe || new Date(),
            estEnRetard: doc.estEnRetard || false
        };
    } catch (error) {
        logger.error('Error mapping deliverable:', {
            error: error.message,
            docId: doc?._id
        });
        return null;
    }
}

// Definition des resolvers pour les livrables
const Query = {
    /**
     * Liste des livrables avec pagination et filtres
     */
    deliverables: async (_, {
        page = 1,
        limit = 10,
        projetId = null,
        statut = null,
        recherche = null,
        dateLimiteMin = null,
        dateLimiteMax = null
    }, context) => {
        checkAuthorization(context, 'read', 'livrables');

        try {
            // Construire le filtre
            const filter = {};

            if (projetId && mongoose.Types.ObjectId.isValid(projetId)) {
                filter.projetId = projetId;
            }

            if (statut && Object.values(Enum.StatutLivrable).includes(statut)) {
                filter.statut = statut;
            }

            if (recherche) {
                filter.$or = [
                    { intitule: { $regex: recherche, $options: 'i' } },
                    { description: { $regex: recherche, $options: 'i' } }
                ];
            }

            if (dateLimiteMin) {
                filter.dateLimite = { $gte: new Date(dateLimiteMin) };
            }

            if (dateLimiteMax) {
                filter.dateLimite = { ...filter.dateLimite, $lte: new Date(dateLimiteMax) };
            }

            // Calculer le skip pour la pagination
            const skip = (page - 1) * limit;

            // Recuperer les livrables avec pagination
            const livrables = await Livrable.find(filter)
                .sort({ majLe: -1 })
                .skip(skip)
                .limit(limit)
                .populate('projetId', 'titre statut')
                .lean()
                .exec();

            // Compter le nombre total pour la pagination
            const total = await Livrable.countDocuments(filter);

            return {
                items: livrables.map(mapLivrableMongoVersGraphQL),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasNextPage: skip + limit < total,
                    hasPreviousPage: page > 1
                }
            };
        } catch (error) {
            logger.error('Error fetching deliverables:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                filter: { page, limit, projetId, statut }
            });

            throw new AppError(
                'Failed to fetch deliverables',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    /**
     * Get a deliverable by ID
     */
    deliverable: async (_, { id }, context) => {
        checkAuthorization(context, 'read', 'livrables');

        try {
            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'Invalid deliverable ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Use dataloader
            const livrable = await context.loaders.livrableLoader.load(id);

            if (!livrable) {
                throw new AppError(
                    'Deliverable not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            return mapLivrableMongoVersGraphQL(livrable);
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error(`Error fetching deliverable ${id}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Failed to fetch deliverable',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    /**
     * Get deliverables by project ID
     */
    livrablesByProjet: async (_, { projetId }, context) => {
        checkAuthorization(context, 'read', 'livrables');

        try {
            // Validate project ID
            if (!mongoose.Types.ObjectId.isValid(projetId)) {
                throw new AppError(
                    'Invalid project ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Use dataloader
            const livrables = await context.loaders.livrablesByProjetLoader.load(projetId);

            return livrables.map(mapLivrableMongoVersGraphQL);
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error(`Error fetching deliverables for project ${projetId}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Failed to fetch project deliverables',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    }
};

const Mutation = {
    /**
     * Create a new deliverable
     */
    addDeliverable: async (_, { projectId, input }, context) => {
        checkAuthorization(context, 'create', 'livrables');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Validate input
            validateInput(input, {
                name: { required: true, type: 'string', minLength: 3 },
                description: { required: true, type: 'string', minLength: 10 },
                deadline: { required: true, type: 'date' },
                repositoryUrl: { type: 'string', pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/ },
                status: { type: 'string', enum: Object.values(Enum.StatutLivrable) }
            });

            // Check if project exists
            const projet = await Projet.findById(projectId).session(session);
            if (!projet) {
                throw new AppError(
                    'Project not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Create deliverable
            const livrable = new Livrable({
                intitule: input.name,
                description: input.description,
                dateLimite: input.deadline,
                urlDepot: input.repositoryUrl,
                projetId: projectId,
                statut: input.status || Enum.StatutLivrable.EN_ATTENTE,
                createur: context.user?._id,
                creeLe: new Date(),
                majLe: new Date()
            });

            const saved = await livrable.save({ session });

            // Update project
            projet.livrables.push(saved._id);
            await projet.save({ session });

            await session.commitTransaction();

            // Invalidate DataLoader caches
            context.loaders.livrableLoader.clear(saved._id);
            context.loaders.livrablesByProjetLoader.clear(projectId);
            context.loaders.projetLoader.clear(projectId);

            logger.info(`Deliverable created: ${saved._id}`, {
                userId: context.user?._id,
                projectId: projectId,
                requestId: context.requestId
            });

            return mapLivrableMongoVersGraphQL(saved);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            const appError = handleMongooseError(
                error,
                'Failed to create deliverable',
                context.requestId
            );

            logger.error('Error creating deliverable:', {
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

    /**
     * Update a deliverable
     */
    updateDeliverable: async (_, { id, input }, context) => {
        checkAuthorization(context, 'update', 'livrables');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'Invalid deliverable ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Validate input
            if (input.name) validateInput({ name: input.name }, { name: { type: 'string', minLength: 3 } });
            if (input.description) validateInput({ description: input.description }, { description: { type: 'string', minLength: 10 } });
            if (input.repositoryUrl) validateInput({ repositoryUrl: input.repositoryUrl }, { repositoryUrl: { type: 'string', pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/ } });

            const updateData = {
                intitule: input.name,
                description: input.description,
                dateLimite: input.deadline,
                urlDepot: input.repositoryUrl,
                statut: input.status,
                majLe: new Date(),
                majPar: context.user?._id
            };

            const livrable = await Livrable.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true,
                    session
                }
            ).populate('projetId', 'titre statut');

            if (!livrable) {
                throw new AppError(
                    'Deliverable not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            await session.commitTransaction();

            // Invalidate DataLoader caches
            context.loaders.livrableLoader.clear(id);
            context.loaders.livrablesByProjetLoader.clear(livrable.projetId);
            context.loaders.projetLoader.clear(livrable.projetId);

            logger.info(`Deliverable updated: ${id}`, {
                userId: context.user?._id,
                projectId: livrable.projetId,
                requestId: context.requestId
            });

            return mapLivrableMongoVersGraphQL(livrable);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            const appError = handleMongooseError(
                error,
                'Failed to update deliverable',
                context.requestId
            );

            logger.error(`Error updating deliverable ${id}:`, {
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

    /**
     * Delete a deliverable
     */
    deleteDeliverable: async (_, { id }, context) => {
        checkAuthorization(context, 'delete', 'livrables');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'Invalid deliverable ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            const livrable = await Livrable.findByIdAndDelete(id).session(session);

            if (!livrable) {
                throw new AppError(
                    'Deliverable not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Update parent project
            const projet = await Projet.findById(livrable.projetId).session(session);
            if (projet) {
                projet.livrables = projet.livrables.filter(lId => lId.toString() !== id);
                await projet.calculerProgression();
                await projet.save({ session });
            }

            await session.commitTransaction();

            // Invalidate DataLoader caches
            context.loaders.livrableLoader.clear(id);
            context.loaders.livrablesByProjetLoader.clear(livrable.projetId);
            context.loaders.projetLoader.clear(livrable.projetId);

            logger.info(`Deliverable deleted: ${id}`, {
                userId: context.user?._id,
                projectId: livrable.projetId,
                requestId: context.requestId
            });

            return mapLivrableMongoVersGraphQL(livrable);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            logger.error(`Error deleting deliverable ${id}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Failed to delete deliverable',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        } finally {
            await session.endSession();
        }
    }
};

// Resolvers pour les champs calculés
const LivrableResolver = {
    projet: async (parent, _, context) => {
        if (!parent.projetId) return null;
        try {
            const projet = await context.loaders.projetLoader.load(parent.projetId);
            return mapProjetMongoVersGraphQL(projet);
        } catch (error) {
            logger.error(`Error loading project ${parent.projetId}:`, error);
            return null;
        }
    },
    estEnRetard: (parent) => {
        if (!parent.dateLimite) return false;
        if (parent.statut === Enum.StatutLivrable.TERMINE ||
            parent.statut === Enum.StatutLivrable.VALIDE) return false;
        return new Date() > new Date(parent.dateLimite);
    }
};

module.exports = {
    Query,
    Mutation,
    Livrable: LivrableResolver,
    mapLivrableMongoVersGraphQL
};