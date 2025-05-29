/**
 * Resolvers GraphQL pour les projets
 *
 * @module graphql/resolvers/projet
 * @created 2025-05-27 par WalidBenTouhami
 */

'use strict';

const mongoose = require('mongoose');
const Projet = require('../../models/projet.model');
const logger = require('../../utils/logger');
const { AppError, ERROR_CODES } = require('../../middleware/errorHandlers');
const { validateInput } = require('../../utils/validators');
const { handleMongooseError } = require('../../utils/errorUtils');

/**
 * Transforme un document MongoDB Projet en type GraphQL
 * @param {mongoose.Document} doc - Document MongoDB
 * @returns {Object|null} - Objet formate pour GraphQL
 */
function mapProjetMongoVersGraphQL(doc) {
    if (!doc) return null;
    try {
        return {
            _id: doc._id.toString(),
            titre: doc.titre || '',
            description: doc.description || '',
            equipe: Array.isArray(doc.equipe)
                ? doc.equipe.map(id => id?.toString() || '')
                : [],
            tuteur: doc.tuteur?.toString() || null,
            competences: Array.isArray(doc.competences) ? doc.competences : [],
            dateDebut: doc.dateDebut || null,
            dateFin: doc.dateFin || null,
            livrables: Array.isArray(doc.livrables)
                ? doc.livrables.map(id => id?.toString() || '')
                : [],
            statut: doc.statut || 'EN_COURS',
            creeLe: doc.creeLe || new Date(),
            majLe: doc.majLe || new Date(),
            __typename: 'Projet'
        };
    } catch (error) {
        logger.error('Erreur lors du mapping Projet:', {
            error: error.message,
            docId: doc?._id
        });
        return null;
    }
}

// Definition des resolvers pour les projets
const Query = {
    /**
     * Liste des projets avec pagination et filtres
     */
    projets: async (_, {
        page = 1,
        limit = 10,
        statut = null,
        recherche = null
    }, context) => {
        checkAuthorization(context, 'read', 'projets');

        try {
            // Construire le filtre
            const filter = {};
            if (statut) filter.statut = statut;
            if (recherche) {
                filter.$or = [
                    { titre: { $regex: recherche, $options: 'i' } },
                    { description: { $regex: recherche, $options: 'i' } }
                ];
            }

            // Calculer le skip pour la pagination
            const skip = (page - 1) * limit;

            // Recuperer les projets avec pagination
            const projets = await Projet.find(filter)
                .sort({ majLe: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v')
                .lean()
                .exec();

            // Compter le nombre total pour la pagination
            const total = await Projet.countDocuments(filter);

            return {
                items: projets.map(mapProjetMongoVersGraphQL),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error('Erreur lors de la recuperation des projets:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                filter: { page, limit, statut, recherche }
            });

            throw new AppError(
                'Impossible de recuperer les projets',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    /**
     * Recuperer un projet par son ID
     */
    projet: async (_, { id }, context) => {
        checkAuthorization(context, 'read', 'projets');

        try {
            // Valider l'ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'ID de projet invalide',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Utiliser le dataloader pour eviter les requetes en double
            const projet = await context.loaders.projetLoader.load(id);

            if (!projet) {
                throw new AppError(
                    'Projet non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            return mapProjetMongoVersGraphQL(projet);
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error(`Erreur lors de la recuperation du projet ${id}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Erreur lors de la recuperation du projet',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },
};

const Mutation = {
    /**
     * Creer un nouveau projet
     */
    creerProjet: async (_, { input }, context) => {
        checkAuthorization(context, 'create', 'projets');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Valider les donnees d'entree
            validateInput(input, {
                titre: { required: true, type: 'string', minLength: 3 },
                description: { required: true, type: 'string' },
                equipe: { type: 'array', itemType: 'string' },
                tuteur: { type: 'string' },
                competences: { type: 'array', itemType: 'string' },
                dateDebut: { type: 'date' },
                dateFin: { type: 'date' }
            });

            // Creer le projet
            const projet = new Projet({
                ...input,
                createur: context.user?._id,
                creeLe: new Date(),
                majLe: new Date()
            });

            const saved = await projet.save({ session });

            // Ajouter l'activite d'audit
            logger.info(`Projet cree: ${saved._id}`, {
                userId: context.user?._id,
                requestId: context.requestId
            });

            await session.commitTransaction();

            // Invalider le cache DataLoader
            context.loaders.projetLoader.clear(saved._id);

            return mapProjetMongoVersGraphQL(saved);
        } catch (error) {
            await session.abortTransaction();

            const appError = handleMongooseError(
                error,
                'Impossible de creer le projet',
                context.requestId
            );

            logger.error('Erreur lors de la creation du projet:', {
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
     * Mettre à jour un projet existant
     */
    mettreAJourProjet: async (_, { id, input }, context) => {
        checkAuthorization(context, 'update', 'projets');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Valider l'ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'ID de projet invalide',
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

            // Verifier si le projet existe
            const existingProjet = await Projet.findById(id).session(session);
            if (!existingProjet) {
                throw new AppError(
                    'Projet non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Mettre à jour le projet
            const maj = await Projet.findByIdAndUpdate(
                id,
                {
                    ...input,
                    majLe: new Date(),
                    majPar: context.user?._id
                },
                { new: true, runValidators: true, session }
            ).lean();

            await session.commitTransaction();

            // Invalider les caches
            context.loaders.projetLoader.clear(id);

            logger.info(`Projet mis à jour: ${id}`, {
                userId: context.user?._id,
                requestId: context.requestId
            });

            return mapProjetMongoVersGraphQL(maj);
        } catch (error) {
            await session.abortTransaction();

            const appError = handleMongooseError(
                error,
                `Impossible de mettre à jour le projet ${id}`,
                context.requestId
            );

            logger.error(`Erreur lors de la mise à jour du projet ${id}:`, {
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
     * Supprimer un projet et ses livrables associes
     */
    supprimerProjet: async (_, { id }, context) => {
        checkAuthorization(context, 'delete', 'projets');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Valider l'ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'ID de projet invalide',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Verifier si le projet existe et le recuperer
            const projet = await Projet.findById(id).session(session);
            if (!projet) {
                throw new AppError(
                    'Projet non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Garder une copie des donnees pour le retour
            const projetCopy = { ...projet.toObject() };

            // Supprimer le projet
            await Projet.findByIdAndDelete(id, { session });

            // Supprimer egalement les livrables associes
            const { deletedCount } = await require('../../models/livrable.model').deleteMany(
                { projetId: id },
                { session }
            );

            await session.commitTransaction();

            // Invalider les caches
            context.loaders.projetLoader.clear(id);
            if (projet.livrables && projet.livrables.length > 0) {
                projet.livrables.forEach(livId => {
                    context.loaders.livrableLoader.clear(livId);
                });
            }
            context.loaders.livrablesByProjetLoader.clear(id);

            logger.info(`Projet supprime: ${id}, avec ${deletedCount} livrables`, {
                userId: context.user?._id,
                requestId: context.requestId
            });

            return mapProjetMongoVersGraphQL(projetCopy);
        } catch (error) {
            await session.abortTransaction();

            const appError = handleMongooseError(
                error,
                `Impossible de supprimer le projet ${id}`,
                context.requestId
            );

            logger.error(`Erreur lors de la suppression du projet ${id}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw appError;
        } finally {
            await session.endSession();
        }
    },
};

// Resolvers pour les champs complexes du type Projet
const Types = {
    Projet: {
        /**
         * Calcule la progression du projet
         */
        progression: (projet) => {
            try {
                if (!projet.dateDebut || !projet.dateFin) return null;

                const maintenant = new Date();
                const debut = new Date(projet.dateDebut);
                const fin = new Date(projet.dateFin);

                if (isNaN(debut.getTime()) || isNaN(fin.getTime())) return null;

                if (maintenant < debut) return 0;
                if (maintenant > fin) return 100;

                const total = fin.getTime() - debut.getTime();
                const ecoule = maintenant.getTime() - debut.getTime();

                return Math.round((ecoule / total) * 100);
            } catch (error) {
                logger.error('Erreur lors du calcul de la progression:', {
                    error: error.message,
                    projetId: projet?._id
                });
                return null;
            }
        },

        /**
         * Resolution des livrables associes au projet
         */
        livrables: async (projet, _, context) => {
            try {
                // Si les livrables sont dejà charges et references par ID
                if (projet.livrables && projet.livrables.length > 0) {
                    // Utiliser le DataLoader pour charger les livrables en batch
                    const livrablesRefs = await context.loaders.livrablesByProjetLoader.load(projet._id);
                    return livrablesRefs.map(require('./livrable.resolver').mapLivrableMongoVersGraphQL);
                }
                return [];
            } catch (error) {
                logger.error('Erreur lors de la resolution des livrables:', {
                    error: error.message,
                    projetId: projet?._id
                });
                return [];
            }
        }
    }
};

module.exports = {
    Query,
    Mutation,
    Types,
    mapProjetMongoVersGraphQL
};