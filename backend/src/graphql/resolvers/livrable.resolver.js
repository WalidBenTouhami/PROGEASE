/**
 * Resolvers GraphQL pour les livrables
 *
 * @module graphql/resolvers/livrable
 * @created 2025-05-27 par WalidBenTouhami
 */

'use strict';

const mongoose = require('mongoose');
const Livrable = require('../../models/livrable.model');
const logger = require('../../utils/logger');
const { AppError, ERROR_CODES } = require('../../middleware/errorHandlers');
const { validateInput } = require('../../utils/validators');
const { handleMongooseError } = require('../../utils/errorUtils');
const { mapProjetMongoVersGraphQL } = require('./projet.resolver');

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
            nom: doc.nom || '',
            description: doc.description || '',
            dateLimite: doc.dateLimite || null,
            urlDepot: doc.urlDepot || '',
            statut: doc.statut || 'EN_ATTENTE',
            projetId: doc.projetId?.toString() || '',
            creeLe: doc.creeLe || new Date(),
            majLe: doc.majLe || new Date(),
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
        projetId,
        page = 1,
        limit = 10,
        statut = null
    }, context) => {
        checkAuthorization(context, 'read', 'livrables');

        try {
            // Construire le filtre
            const filter = {};
            if (projetId) {
                if (!mongoose.Types.ObjectId.isValid(projetId)) {
                    throw new AppError(
                        'ID de projet invalide',
                        400,
                        ERROR_CODES.BAD_REQUEST,
                        true
                    );
                }
                filter.projetId = projetId;
            }

            if (statut) filter.statut = statut;

            // Si un projetId est fourni, utiliser le DataLoader
            if (projetId) {
                const livrables = await context.loaders.livrablesByProjetLoader.load(projetId);

                // Appliquer manuellement la pagination et les filtres
                let filteredLivrables = statut
                    ? livrables.filter(l => l.statut === statut)
                    : livrables;

                const total = filteredLivrables.length;
                const skip = (page - 1) * limit;
                filteredLivrables = filteredLivrables
                    .sort((a, b) => new Date(b.majLe) - new Date(a.majLe))
                    .slice(skip, skip + limit);

                return {
                    items: filteredLivrables.map(mapLivrableMongoVersGraphQL),
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                };
            }

            // Sans projetId, faire une requete normale
            const skip = (page - 1) * limit;
            const livrables = await Livrable.find(filter)
                .sort({ majLe: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v')
                .lean()
                .exec();

            const total = await Livrable.countDocuments(filter);

            return {
                items: livrables.map(mapLivrableMongoVersGraphQL),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error('Erreur lors de la recuperation des livrables:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                filter: { projetId, page, limit, statut }
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
    }
};

const Mutation = {
    /**
     * Ajouter un livrable à un projet
     */
    ajouterLivrable: async (_, { projetId, input }, context) => {
        checkAuthorization(context, 'create', 'livrables');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Valider l'ID du projet
            if (!mongoose.Types.ObjectId.isValid(projetId)) {
                throw new AppError(
                    'ID de projet invalide',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Verifier si le projet existe
            const Projet = require('../../models/projet.model');
            const projet = await Projet.findById(projetId).session(session);
            if (!projet) {
                throw new AppError(
                    'Projet non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Valider les donnees d'entree
            validateInput(input, {
                nom: { required: true, type: 'string', minLength: 2 },
                description: { type: 'string' },
                dateLimite: { type: 'date' },
                urlDepot: { type: 'string' },
                statut: { type: 'string', enum: ['EN_ATTENTE', 'EN_COURS', 'TERMINE', 'VALIDE', 'REJETE'] }
            });

            // Creer le livrable
            const livrable = new Livrable({
                ...input,
                projetId,
                createur: context.user?._id,
                creeLe: new Date(),
                majLe: new Date()
            });

            const saved = await livrable.save({ session });

            // Mettre à jour la reference dans le projet
            await Projet.findByIdAndUpdate(
                projetId,
                {
                    $push: { livrables: saved._id },
                    majLe: new Date(),
                    majPar: context.user?._id
                },
                { session }
            );

            await session.commitTransaction();

            // Invalider les caches
            context.loaders.livrableLoader.clear(saved._id);
            context.loaders.projetLoader.clear(projetId);
            context.loaders.livrablesByProjetLoader.clear(projetId);

            logger.info(`Livrable ajoute: ${saved._id} au projet ${projetId}`, {
                userId: context.user?._id,
                requestId: context.requestId
            });

            return mapLivrableMongoVersGraphQL(saved);
        } catch (error) {
            await session.abortTransaction();

            const appError = handleMongooseError(
                error,
                `Impossible d'ajouter le livrable au projet ${projetId}`,
                context.requestId
            );

            logger.error(`Erreur lors de l'ajout du livrable au projet ${projetId}:`, {
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
    mettreAJourLivrable: async (_, { livrableId, input }, context) => {
        checkAuthorization(context, 'update', 'livrables');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Valider l'ID
            if (!mongoose.Types.ObjectId.isValid(livrableId)) {
                throw new AppError(
                    'ID de livrable invalide',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Valider les donnees d'entree
            if (Object.keys(input).length === 0) {
                throw new AppError(
                    'Aucune donnee fournie pour la mise à jour',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Verifier si le livrable existe
            const existingLivrable = await Livrable.findById(livrableId).session(session);
            if (!existingLivrable) {
                throw new AppError(
                    'Livrable non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Mettre à jour le livrable
            const maj = await Livrable.findByIdAndUpdate(
                livrableId,
                {
                    ...input,
                    majLe: new Date(),
                    majPar: context.user?._id
                },
                { new: true, runValidators: true, session }
            ).lean();

            await session.commitTransaction();

            // Invalider les caches
            context.loaders.livrableLoader.clear(livrableId);
            context.loaders.livrablesByProjetLoader.clear(existingLivrable.projetId);

            logger.info(`Livrable mis à jour: ${livrableId}`, {
                userId: context.user?._id,
                requestId: context.requestId
            });

            return mapLivrableMongoVersGraphQL(maj);
        } catch (error) {
            await session.abortTransaction();

            const appError = handleMongooseError(
                error,
                `Impossible de mettre à jour le livrable ${livrableId}`,
                context.requestId
            );

            logger.error(`Erreur lors de la mise à jour du livrable ${livrableId}:`, {
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
    supprimerLivrable: async (_, { livrableId }, context) => {
        checkAuthorization(context, 'delete', 'livrables');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Valider l'ID
            if (!mongoose.Types.ObjectId.isValid(livrableId)) {
                throw new AppError(
                    'ID de livrable invalide',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Verifier si le livrable existe
            const livrable = await Livrable.findById(livrableId).session(session);
            if (!livrable) {
                throw new AppError(
                    'Livrable non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Garder une copie des donnees pour le retour
            const livrableCopy = { ...livrable.toObject() };
            const projetId = livrable.projetId;

            // Supprimer le livrable
            await Livrable.findByIdAndDelete(livrableId, { session });

            // Retirer la reference du livrable dans le projet
            const Projet = require('../../models/projet.model');
            await Projet.findByIdAndUpdate(
                projetId,
                {
                    $pull: { livrables: livrableId },
                    majLe: new Date(),
                    majPar: context.user?._id
                },
                { session }
            );

            await session.commitTransaction();

            // Invalider les caches
            context.loaders.livrableLoader.clear(livrableId);
            context.loaders.livrablesByProjetLoader.clear(projetId);
            context.loaders.projetLoader.clear(projetId);

            logger.info(`Livrable supprime: ${livrableId} du projet ${projetId}`, {
                userId: context.user?._id,
                requestId: context.requestId
            });

            return mapLivrableMongoVersGraphQL(livrableCopy);
        } catch (error) {
            await session.abortTransaction();

            const appError = handleMongooseError(
                error,
                `Impossible de supprimer le livrable ${livrableId}`,
                context.requestId
            );

            logger.error(`Erreur lors de la suppression du livrable ${livrableId}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw appError;
        } finally {
            await session.endSession();
        }
    }
};

// Resolvers pour les champs complexes du type Livrable
const Types = {
    Livrable: {
        /**
         * Resolution du projet associe au livrable
         */
        projet: async (livrable, _, context) => {
            try {
                if (!livrable.projetId) return null;

                const projet = await context.loaders.projetLoader.load(livrable.projetId);
                return mapProjetMongoVersGraphQL(projet);
            } catch (error) {
                logger.error('Erreur lors de la resolution du projet:', {
                    error: error.message,
                    livrableId: livrable?._id,
                    projetId: livrable?.projetId
                });
                return null;
            }
        }
    }
};

module.exports = {
    Query,
    Mutation,
    Types,
    mapLivrableMongoVersGraphQL
};