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
const { Enum } = require('../../../config/constants');
const { checkAuthorization } = require('../../utils/auth.utils');

/**
 * Transforme un document MongoDB Projet en type GraphQL
 * @param {mongoose.Document} doc - Document MongoDB
 * @returns {Object|null} - Objet formate pour GraphQL
 */
function mapProjetMongoVersGraphQL(doc) {
    if (!doc) return null;
    return {
        id: doc._id.toString(),
        titre: doc.titre || '',
        description: doc.description || '',
        statut: doc.statut || Enum.StatutProjet.BROUILLON,
        equipe: doc.equipe || [],
        tuteur: doc.tuteur,
        competences: doc.competences || [],
        dateDebut: doc.dateDebut,
        dateFin: doc.dateFin,
        livrables: doc.livrables || [],
        evaluations: doc.evaluations || [],
        progression: doc.progression || 0,
        moyenneEvaluations: doc.moyenneEvaluations || 0,
        performancePredite: doc.performancePredite || 0,
        creeLe: doc.creeLe,
        majLe: doc.majLe
    };
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
        recherche = null,
        dateDebutMin = null,
        dateFinMax = null,
        tuteurId = null,
        membreEquipe = null,
        competence = null
    }, context) => {
        checkAuthorization(context, 'read', 'projets');

        try {
            // Construire le filtre
            const filter = {};

            if (statut && Object.values(Enum.StatutProjet).includes(statut)) {
                filter.statut = statut;
            }

            if (recherche) {
                filter.$or = [
                    { titre: { $regex: recherche, $options: 'i' } },
                    { description: { $regex: recherche, $options: 'i' } }
                ];
            }

            if (dateDebutMin) {
                filter.dateDebut = { $gte: new Date(dateDebutMin) };
            }

            if (dateFinMax) {
                filter.dateFin = { $lte: new Date(dateFinMax) };
            }

            if (tuteurId && mongoose.Types.ObjectId.isValid(tuteurId)) {
                filter.tuteur = tuteurId;
            }

            if (membreEquipe && mongoose.Types.ObjectId.isValid(membreEquipe)) {
                filter.equipe = membreEquipe;
            }

            if (competence) {
                filter.competences = competence;
            }

            // Calculer le skip pour la pagination
            const skip = (page - 1) * limit;

            // Recuperer les projets avec pagination
            const projets = await Projet.find(filter)
                .sort({ majLe: -1 })
                .skip(skip)
                .limit(limit)
                .populate('tuteur', 'nom prenom email')
                .populate('equipe', 'nom prenom email')
                .populate('livrablesComplets')
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
                    pages: Math.ceil(total / limit),
                    hasNextPage: skip + limit < total,
                    hasPreviousPage: page > 1
                }
            };
        } catch (error) {
            logger.error('Error fetching projects:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                filter: { page, limit, statut, recherche }
            });

            throw new AppError(
                'Failed to fetch projects',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    /**
     * Get a project by ID
     */
    projet: async (_, { id }, context) => {
        checkAuthorization(context, 'read', 'projets');

        try {
            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'Invalid project ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Use dataloader to avoid duplicate requests
            const projet = await context.loaders.projetLoader.load(id);

            if (!projet) {
                throw new AppError(
                    'Project not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            return mapProjetMongoVersGraphQL(projet);
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error(`Error fetching project ${id}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Failed to fetch project',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    /**
     * Analyze project risks
     */
    analyserRisquesProjet: async (_, { projetId }, context) => {
        checkAuthorization(context, 'read', 'projets');

        try {
            const projet = await Projet.findById(projetId)
                .populate('livrablesComplets')
                .populate('equipe', 'nom prenom email');

            if (!projet) {
                throw new AppError(
                    'Project not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Risk analysis based on multiple factors
            const risques = {
                retard: projet.estEnRetard,
                progression: projet.progression < 50 && projet.dateFin < new Date(),
                livrables: projet.livrablesComplets.some(l => l.estEnRetard()),
                equipe: projet.equipe.length < 2
            };

            const niveauRisque = Object.values(risques).filter(Boolean).length;

            const recommandations = [];
            if (risques.retard) {
                recommandations.push('Review project schedule and adjust deadlines');
            }
            if (risques.progression) {
                recommandations.push('Increase resources allocated to the project');
            }
            if (risques.livrables) {
                recommandations.push('Schedule a follow-up meeting for late deliverables');
            }
            if (risques.equipe) {
                recommandations.push('Strengthen the project team');
            }

            return {
                ...risques,
                niveauRisque,
                recommandations
            };
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error('Error analyzing project risks:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                projetId
            });

            throw new AppError(
                'Failed to analyze project risks',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    getProjectProgress: async (_, { id }, context) => {
        try {
            const projet = await Projet.findById(id);
            if (!projet) throw new Error('Project not found');
            return projet.progression || 0;
        } catch (error) {
            logger.error(`Error getting project progress ${id}:`, error);
            throw new Error('Failed to get project progress');
        }
    },

    getPredictedPerformance: async (_, { id }, context) => {
        try {
            const projet = await Projet.findById(id);
            if (!projet) throw new Error('Project not found');
            return projet.performancePredite || 0;
        } catch (error) {
            logger.error(`Error getting predicted performance ${id}:`, error);
            throw new Error('Failed to get predicted performance');
        }
    }
};

const Mutation = {
    /**
     * Create a new project
     */
    createProject: async (_, { input }, context) => {
        checkAuthorization(context, 'create', 'projets');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Validate input
            validateInput(input, {
                titre: { required: true, type: 'string', minLength: 5 },
                description: { required: true, type: 'string', minLength: 10 },
                equipe: { type: 'array', itemType: 'string' },
                tuteur: { type: 'string' },
                competences: { required: true, type: 'array', itemType: 'string', minLength: 1 },
                dateDebut: { required: true, type: 'date' },
                dateFin: { required: true, type: 'date' },
                urlDepot: { type: 'string', pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/ }
            });

            // Create project
            const projet = new Projet({
                ...input,
                statut: input.statut || Enum.StatutProjet.BROUILLON,
                progression: 0,
                createur: context.user?._id,
                creeLe: new Date(),
                majLe: new Date()
            });

            const saved = await projet.save({ session });

            // Add audit activity
            logger.info(`Project created: ${saved._id}`, {
                userId: context.user?._id,
                requestId: context.requestId
            });

            await session.commitTransaction();

            // Invalidate DataLoader cache
            context.loaders.projetLoader.clear(saved._id);

            return mapProjetMongoVersGraphQL(saved);
        } catch (error) {
            await session.abortTransaction();

            const appError = handleMongooseError(
                error,
                'Failed to create project',
                context.requestId
            );

            logger.error('Error creating project:', {
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
     * Update an existing project
     */
    updateProject: async (_, { id, input }, context) => {
        checkAuthorization(context, 'update', 'projets');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'Invalid project ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Validate input
            if (input.titre) validateInput({ titre: input.titre }, { titre: { type: 'string', minLength: 5 } });
            if (input.description) validateInput({ description: input.description }, { description: { type: 'string', minLength: 10 } });
            if (input.competences) validateInput({ competences: input.competences }, { competences: { type: 'array', itemType: 'string', minLength: 1 } });
            if (input.urlDepot) validateInput({ urlDepot: input.urlDepot }, { urlDepot: { type: 'string', pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/ } });

            const updateData = {
                ...input,
                majLe: new Date(),
                majPar: context.user?._id
            };

            // Convert dates if present
            if (updateData.dateDebut) updateData.dateDebut = new Date(updateData.dateDebut);
            if (updateData.dateFin) updateData.dateFin = new Date(updateData.dateFin);

            const projetMisAJour = await Projet.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true,
                    session
                }
            ).populate('tuteur', 'nom prenom email')
                .populate('equipe', 'nom prenom email')
                .populate('livrablesComplets');

            if (!projetMisAJour) {
                throw new AppError(
                    'Project not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Recalculate progress if necessary
            if (input.livrables || input.statut) {
                await projetMisAJour.calculerProgression();
                await projetMisAJour.save({ session });
            }

            await session.commitTransaction();

            // Invalidate DataLoader cache
            context.loaders.projetLoader.clear(id);

            logger.info(`Project updated: ${id}`, {
                userId: context.user?._id,
                requestId: context.requestId
            });

            return mapProjetMongoVersGraphQL(projetMisAJour);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            const appError = handleMongooseError(
                error,
                'Failed to update project',
                context.requestId
            );

            logger.error(`Error updating project ${id}:`, {
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
     * Delete a project
     */
    deleteProject: async (_, { id }, context) => {
        checkAuthorization(context, 'delete', 'projets');

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError(
                    'Invalid project ID',
                    400,
                    ERROR_CODES.BAD_REQUEST,
                    true
                );
            }

            // Delete associated deliverables first
            const Livrable = require('../../models/livrable.model');
            await Livrable.deleteMany({ projetId: id }).session(session);

            const projetSupprime = await Projet.findByIdAndDelete(id).session(session);

            if (!projetSupprime) {
                throw new AppError(
                    'Project not found',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            await session.commitTransaction();

            // Invalidate DataLoader cache
            context.loaders.projetLoader.clear(id);

            logger.info(`Project deleted: ${id}`, {
                userId: context.user?._id,
                requestId: context.requestId
            });

            return mapProjetMongoVersGraphQL(projetSupprime);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            logger.error(`Error deleting project ${id}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Failed to delete project',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        } finally {
            await session.endSession();
        }
    }
};

// Resolvers pour les champs complexes du type Projet
const ProjetResolver = {
    equipe: async (parent, _, context) => {
        if (!parent.equipe || parent.equipe.length === 0) return [];
        try {
            const users = await context.loaders.userLoader.loadMany(
                parent.equipe.map(id => id.toString())
            );
            return users.filter(Boolean);
        } catch (error) {
            logger.error(`Error loading team members for project ${parent.id}:`, error);
            return [];
        }
    },
    tuteur: async (parent, _, context) => {
        if (!parent.tuteur) return null;
        try {
            return await context.loaders.userLoader.load(parent.tuteur.toString());
        } catch (error) {
            logger.error(`Error loading tutor for project ${parent.id}:`, error);
            return null;
        }
    },
    livrables: async (parent, _, context) => {
        if (!parent.livrables || parent.livrables.length === 0) return [];
        try {
            const livrables = await context.loaders.livrableLoader.loadMany(
                parent.livrables.map(id => id.toString())
            );
            return livrables.filter(Boolean);
        } catch (error) {
            logger.error(`Error loading deliverables for project ${parent.id}:`, error);
            return [];
        }
    },
    evaluations: async (parent, _, context) => {
        if (!parent.evaluations || parent.evaluations.length === 0) return [];
        try {
            const evaluations = await context.loaders.evaluationLoader.loadMany(
                parent.evaluations.map(id => id.toString())
            );
            return evaluations.filter(Boolean);
        } catch (error) {
            logger.error(`Error loading evaluations for project ${parent.id}:`, error);
            return [];
        }
    }
};

module.exports = {
    Query,
    Mutation,
    Projet: ProjetResolver,
    mapProjetMongoVersGraphQL
};