/**
 * Resolvers GraphQL pour l'API PROGEASE
 * Implémentation des requêtes et mutations pour les projets et livrables
 *
 * @module graphql/resolvers
 */

'use strict';

const mongoose = require('mongoose');
const DataLoader = require('dataloader');
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const logger = require('../utils/logger');
const { AppError, ERROR_CODES } = require('../middleware/errorHandlers');
const { validateInput } = require('../utils/validators');
const { handleMongooseError } = require('../utils/errorUtils');

/**
 * Transforme un document MongoDB Projet en type GraphQL
 * @param {mongoose.Document} doc - Document MongoDB
 * @returns {Object|null} - Objet formaté pour GraphQL
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

/**
 * Transforme un document MongoDB Livrable en type GraphQL
 * @param {mongoose.Document} doc - Document MongoDB
 * @returns {Object|null} - Objet formaté pour GraphQL
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

/**
 * Crée les DataLoaders pour optimiser les requêtes N+1
 * @param {mongoose.Connection} connection - Connexion MongoDB active
 * @returns {Object} - Ensemble de DataLoaders
 */
function createLoaders(connection) {
    return {
        projetLoader: new DataLoader(async (ids) => {
            const projets = await Projet.find({ _id: { $in: ids } })
                .lean()
                .exec();

            const projectsMap = new Map(
                projets.map(projet => [projet._id.toString(), projet])
            );

            return ids.map(id => projectsMap.get(id.toString()) || null);
        }, { cache: true }),

        livrableLoader: new DataLoader(async (ids) => {
            const livrables = await Livrable.find({ _id: { $in: ids } })
                .lean()
                .exec();

            const livrablesMap = new Map(
                livrables.map(livrable => [livrable._id.toString(), livrable])
            );

            return ids.map(id => livrablesMap.get(id.toString()) || null);
        }, { cache: true }),

        livrablesByProjetLoader: new DataLoader(async (projetIds) => {
            const livrables = await Livrable.find({ projetId: { $in: projetIds } })
                .lean()
                .exec();

            const livrablesMap = new Map();
            projetIds.forEach(id => livrablesMap.set(id.toString(), []));

            livrables.forEach(livrable => {
                const projetId = livrable.projetId.toString();
                if (livrablesMap.has(projetId)) {
                    livrablesMap.get(projetId).push(livrable);
                }
            });

            return projetIds.map(id => livrablesMap.get(id.toString()) || []);
        }, { cache: true })
    };
}

/**
 * Vérifie les autorisations d'accès
 * @param {Object} context - Contexte GraphQL
 * @param {string} action - Action à effectuer
 * @param {string} resource - Ressource concernée
 * @throws {AppError} Si l'utilisateur n'est pas autorisé
 */
function checkAuthorization(context, action, resource) {
    // Dans une implémentation réelle, vous auriez une logique d'autorisation complète ici
    if (!context.user && (action !== 'read' || resource === 'admin')) {
        throw new AppError(
            'Non autorisé',
            403,
            ERROR_CODES.FORBIDDEN,
            true
        );
    }

    // Exemple: vérifier si l'utilisateur est admin pour certaines actions
    const isAdmin = context.user?.role === 'ADMIN';

    if ((action === 'delete' || action === 'update') && !isAdmin) {
        throw new AppError(
            'Privilèges insuffisants pour cette opération',
            403,
            ERROR_CODES.FORBIDDEN,
            true
        );
    }

    return true;
}

/**
 * Définition des resolvers GraphQL
 */
const resolvers = {
    Query: {
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

                // Récupérer les projets avec pagination
                const projets = await Projet.find(filter)
                    .sort({ majLe: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select('-__v') // Projection pour exclure les champs inutiles
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
                logger.error('Erreur lors de la récupération des projets:', {
                    error: error.message,
                    stack: error.stack,
                    requestId: context.requestId,
                    filter: { page, limit, statut, recherche }
                });

                throw new AppError(
                    'Impossible de récupérer les projets',
                    500,
                    ERROR_CODES.SERVER_ERROR,
                    false
                );
            }
        },

        /**
         * Récupérer un projet par son ID
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

                // Utiliser le dataloader pour éviter les requêtes en double
                const projet = await context.loaders.projetLoader.load(id);

                if (!projet) {
                    throw new AppError(
                        'Projet non trouvé',
                        404,
                        ERROR_CODES.NOT_FOUND,
                        true
                    );
                }

                return mapProjetMongoVersGraphQL(projet);
            } catch (error) {
                if (error instanceof AppError) throw error;

                logger.error(`Erreur lors de la récupération du projet ${id}:`, {
                    error: error.message,
                    stack: error.stack,
                    requestId: context.requestId
                });

                throw new AppError(
                    'Erreur lors de la récupération du projet',
                    500,
                    ERROR_CODES.SERVER_ERROR,
                    false
                );
            }
        },

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

                // Sans projetId, faire une requête normale
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

                logger.error('Erreur lors de la récupération des livrables:', {
                    error: error.message,
                    stack: error.stack,
                    requestId: context.requestId,
                    filter: { projetId, page, limit, statut }
                });

                throw new AppError(
                    'Impossible de récupérer les livrables',
                    500,
                    ERROR_CODES.SERVER_ERROR,
                    false
                );
            }
        },

        /**
         * Récupérer un livrable par son ID
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
                        'Livrable non trouvé',
                        404,
                        ERROR_CODES.NOT_FOUND,
                        true
                    );
                }

                return mapLivrableMongoVersGraphQL(livrable);
            } catch (error) {
                if (error instanceof AppError) throw error;

                logger.error(`Erreur lors de la récupération du livrable ${id}:`, {
                    error: error.message,
                    stack: error.stack,
                    requestId: context.requestId
                });

                throw new AppError(
                    'Erreur lors de la récupération du livrable',
                    500,
                    ERROR_CODES.SERVER_ERROR,
                    false
                );
            }
        },
    },

    Mutation: {
        /**
         * Créer un nouveau projet
         */
        creerProjet: async (_, { input }, context) => {
            checkAuthorization(context, 'create', 'projets');

            const session = await mongoose.startSession();
            try {
                session.startTransaction();

                // Valider les données d'entrée
                validateInput(input, {
                    titre: { required: true, type: 'string', minLength: 3 },
                    description: { required: true, type: 'string' },
                    equipe: { type: 'array', itemType: 'string' },
                    tuteur: { type: 'string' },
                    competences: { type: 'array', itemType: 'string' },
                    dateDebut: { type: 'date' },
                    dateFin: { type: 'date' }
                });

                // Créer le projet
                const projet = new Projet({
                    ...input,
                    createur: context.user?._id,
                    creeLe: new Date(),
                    majLe: new Date()
                });

                const saved = await projet.save({ session });

                // Ajouter l'activité d'audit
                // (Dans une implémentation réelle, vous auriez un système d'audit ici)
                logger.info(`Projet créé: ${saved._id}`, {
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
                    'Impossible de créer le projet',
                    context.requestId
                );

                logger.error('Erreur lors de la création du projet:', {
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

                // Valider les données d'entrée
                if (Object.keys(input).length === 0) {
                    throw new AppError(
                        'Aucune donnée fournie pour la mise à jour',
                        400,
                        ERROR_CODES.BAD_REQUEST,
                        true
                    );
                }

                // Vérifier si le projet existe
                const existingProjet = await Projet.findById(id).session(session);
                if (!existingProjet) {
                    throw new AppError(
                        'Projet non trouvé',
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
         * Supprimer un projet et ses livrables associés
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

                // Vérifier si le projet existe et le récupérer
                const projet = await Projet.findById(id).session(session);
                if (!projet) {
                    throw new AppError(
                        'Projet non trouvé',
                        404,
                        ERROR_CODES.NOT_FOUND,
                        true
                    );
                }

                // Garder une copie des données pour le retour
                const projetCopy = { ...projet.toObject() };

                // Supprimer le projet
                await Projet.findByIdAndDelete(id, { session });

                // Supprimer également les livrables associés
                const { deletedCount } = await Livrable.deleteMany(
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

                logger.info(`Projet supprimé: ${id}, avec ${deletedCount} livrables`, {
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

                // Vérifier si le projet existe
                const projet = await Projet.findById(projetId).session(session);
                if (!projet) {
                    throw new AppError(
                        'Projet non trouvé',
                        404,
                        ERROR_CODES.NOT_FOUND,
                        true
                    );
                }

                // Valider les données d'entrée
                validateInput(input, {
                    nom: { required: true, type: 'string', minLength: 2 },
                    description: { type: 'string' },
                    dateLimite: { type: 'date' },
                    urlDepot: { type: 'string' },
                    statut: { type: 'string', enum: ['EN_ATTENTE', 'EN_COURS', 'TERMINE', 'VALIDE', 'REJETE'] }
                });

                // Créer le livrable
                const livrable = new Livrable({
                    ...input,
                    projetId,
                    createur: context.user?._id,
                    creeLe: new Date(),
                    majLe: new Date()
                });

                const saved = await livrable.save({ session });

                // Mettre à jour la référence dans le projet
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

                logger.info(`Livrable ajouté: ${saved._id} au projet ${projetId}`, {
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

                // Valider les données d'entrée
                if (Object.keys(input).length === 0) {
                    throw new AppError(
                        'Aucune donnée fournie pour la mise à jour',
                        400,
                        ERROR_CODES.BAD_REQUEST,
                        true
                    );
                }

                // Vérifier si le livrable existe
                const existingLivrable = await Livrable.findById(livrableId).session(session);
                if (!existingLivrable) {
                    throw new AppError(
                        'Livrable non trouvé',
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

                // Vérifier si le livrable existe
                const livrable = await Livrable.findById(livrableId).session(session);
                if (!livrable) {
                    throw new AppError(
                        'Livrable non trouvé',
                        404,
                        ERROR_CODES.NOT_FOUND,
                        true
                    );
                }

                // Garder une copie des données pour le retour
                const livrableCopy = { ...livrable.toObject() };
                const projetId = livrable.projetId;

                // Supprimer le livrable
                await Livrable.findByIdAndDelete(livrableId, { session });

                // Retirer la référence du livrable dans le projet
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

                logger.info(`Livrable supprimé: ${livrableId} du projet ${projetId}`, {
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
        },
    },

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
         * Résolution des livrables associés au projet
         */
        livrables: async (projet, _, context) => {
            try {
                // Si les livrables sont déjà chargés et référencés par ID
                if (projet.livrables && projet.livrables.length > 0) {
                    // Utiliser le DataLoader pour charger les livrables en batch
                    const livrablesRefs = await context.loaders.livrablesByProjetLoader.load(projet._id);
                    return livrablesRefs.map(mapLivrableMongoVersGraphQL);
                }
                return [];
            } catch (error) {
                logger.error('Erreur lors de la résolution des livrables:', {
                    error: error.message,
                    projetId: projet?._id
                });
                return [];
            }
        },
    },

    Livrable: {
        /**
         * Résolution du projet associé au livrable
         */
        projet: async (livrable, _, context) => {
            try {
                if (!livrable.projetId) return null;

                const projet = await context.loaders.projetLoader.load(livrable.projetId);
                return mapProjetMongoVersGraphQL(projet);
            } catch (error) {
                logger.error('Erreur lors de la résolution du projet:', {
                    error: error.message,
                    livrableId: livrable?._id,
                    projetId: livrable?.projetId
                });
                return null;
            }
        }
    }
};

/**
 * Fonction d'initialisation des DataLoaders pour les requêtes GraphQL
 * @returns {Object} Loaders configurés
 */
function initLoaders() {
    return createLoaders(mongoose.connection);
}

module.exports = resolvers;
module.exports.initLoaders = initLoaders;