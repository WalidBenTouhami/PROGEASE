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
            _id: doc._id.toString(),
            intitule: doc.intitule || '',
            description: doc.description || '',
            dateLimite: doc.dateLimite || null,
            projetId: doc.projetId?.toString() || '',
            statut: doc.statut || Enum.StatutLivrable.EN_ATTENTE,
            urlDepot: doc.urlDepot || '',
            creeLe: doc.creeLe || new Date(),
            majLe: doc.majLe || new Date(),
            estEnRetard: doc.estEnRetard || false,
            __typename: 'Livrable'
        };
    } catch (error) {
        logger.error('Erreur lors du mapping Livrable:', {
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
    livrables: async (_, {
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
            logger.error('Erreur lors de la recuperation des livrables:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                filter: { page, limit, projetId, statut }
            });

            throw new AppError(
                'Impossible de recuperer les livrables',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    /**
     * Recuperer un livrable par son ID
     */
    livrable: async (_, { id }, context) => {
        checkAuthorization(context, 'read', 'livrables');

        try {
            // Valider l'ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'ID de livrable invalide',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Utiliser le dataloader
            const livrable = await context.loaders.livrableLoader.load(id);

            if (!livrable) {
                throw new AppError(
                    'Livrable non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            return mapLivrableMongoVersGraphQL(livrable);
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error(`Erreur lors de la recuperation du livrable ${id}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Erreur lors de la recuperation du livrable',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    /**
     * Recuperer les livrables d'un projet
     */
    livrablesByProjet: async (_, { projetId }, context) => {
        checkAuthorization(context, 'read', 'livrables');

        try {
            // Valider l'ID du projet
            if (!mongoose.Types.ObjectId.isValid(projetId)) {
                throw new AppError(
                    'ID de projet invalide',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Utiliser le dataloader
            const livrables = await context.loaders.livrablesByProjetLoader.load(projetId);

            return livrables.map(mapLivrableMongoVersGraphQL);
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error(`Erreur lors de la recuperation des livrables du projet ${projetId}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Erreur lors de la recuperation des livrables',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    }
};

const Mutation = {
    /**
     * Creer un nouveau livrable
     */
    creerLivrable: async (_, { input }, context) => {
        checkAuthorization(context, 'create', 'livrables');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Valider les donnees d'entree
            validateInput(input, {
                intitule: { required: true, type: 'string', minLength: 3 },
                description: { required: true, type: 'string', minLength: 10 },
                dateLimite: { required: true, type: 'date' },
                projetId: { required: true, type: 'string' },
                urlDepot: { type: 'string', pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/ }
            });

            // Verifier si le projet existe
            const projet = await Projet.findById(input.projetId).session(session);
            if (!projet) {
                throw new AppError(
                    'Projet non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Creer le livrable
            const livrable = new Livrable({
                ...input,
                statut: input.statut || Enum.StatutLivrable.EN_ATTENTE,
                createur: context.user?._id,
                creeLe: new Date(),
                majLe: new Date()
            });

            const saved = await livrable.save({ session });

            // Mettre à jour le projet
            projet.livrables.push(saved._id);
            await projet.save({ session });

            await session.commitTransaction();

            // Invalider les caches DataLoader
            context.loaders.livrableLoader.clear(saved._id);
            context.loaders.livrablesByProjetLoader.clear(input.projetId);
            context.loaders.projetLoader.clear(input.projetId);

            logger.info(`Livrable cree: ${saved._id}`, {
                userId: context.user?._id,
                projetId: input.projetId,
                requestId: context.requestId
            });

            return mapLivrableMongoVersGraphQL(saved);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            const appError = handleMongooseError(
                error,
                'Impossible de creer le livrable',
                context.requestId
            );

            logger.error('Erreur lors de la creation du livrable:', {
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
     * Mettre à jour un livrable existant
     */
    mettreAJourLivrable: async (_, { id, input }, context) => {
        checkAuthorization(context, 'update', 'livrables');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Valider l'ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'ID de livrable invalide',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Valider les donnees d'entree
            if (input.intitule) validateInput({ intitule: input.intitule }, { intitule: { type: 'string', minLength: 3 } });
            if (input.description) validateInput({ description: input.description }, { description: { type: 'string', minLength: 10 } });
            if (input.urlDepot) validateInput({ urlDepot: input.urlDepot }, { urlDepot: { type: 'string', pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/ } });

            const updateData = {
                ...input,
                majLe: new Date(),
                majPar: context.user?._id
            };

            if (updateData.dateLimite) {
                updateData.dateLimite = new Date(updateData.dateLimite);
            }

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
                    'Livrable non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Mettre à jour la progression du projet si le statut a changé
            if (input.statut) {
                const projet = await Projet.findById(livrable.projetId).session(session);
                if (projet) {
                    await projet.calculerProgression();
                    await projet.save({ session });
                }
            }

            await session.commitTransaction();

            // Invalider les caches DataLoader
            context.loaders.livrableLoader.clear(id);
            context.loaders.livrablesByProjetLoader.clear(livrable.projetId);
            context.loaders.projetLoader.clear(livrable.projetId);

            logger.info(`Livrable mis à jour: ${id}`, {
                userId: context.user?._id,
                projetId: livrable.projetId,
                requestId: context.requestId
            });

            return mapLivrableMongoVersGraphQL(livrable);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            const appError = handleMongooseError(
                error,
                'Impossible de mettre à jour le livrable',
                context.requestId
            );

            logger.error(`Erreur lors de la mise à jour du livrable ${id}:`, {
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
     * Supprimer un livrable
     */
    supprimerLivrable: async (_, { id }, context) => {
        checkAuthorization(context, 'delete', 'livrables');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Valider l'ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'ID de livrable invalide',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            const livrable = await Livrable.findByIdAndDelete(id).session(session);

            if (!livrable) {
                throw new AppError(
                    'Livrable non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Mettre à jour le projet parent
            const projet = await Projet.findById(livrable.projetId).session(session);
            if (projet) {
                projet.livrables = projet.livrables.filter(lId => lId.toString() !== id);
                await projet.calculerProgression();
                await projet.save({ session });
            }

            await session.commitTransaction();

            // Invalider les caches DataLoader
            context.loaders.livrableLoader.clear(id);
            context.loaders.livrablesByProjetLoader.clear(livrable.projetId);
            context.loaders.projetLoader.clear(livrable.projetId);

            logger.info(`Livrable supprime: ${id}`, {
                userId: context.user?._id,
                projetId: livrable.projetId,
                requestId: context.requestId
            });

            return mapLivrableMongoVersGraphQL(livrable);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            logger.error(`Erreur lors de la suppression du livrable ${id}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Impossible de supprimer le livrable',
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
            logger.error(`Erreur lors du chargement du projet ${parent.projetId}:`, error);
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