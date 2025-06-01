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
const { AppError, ERROR_CODES } = require('../../middlewares/errorHandlers');
const { validateInput } = require('../../utils/validators');
const { handleMongooseError } = require('../../utils/errorUtils');
const { Enum } = require('../../../config/constants');
const { checkAuthorization } = require('../../utils/auth.utils');
const Livrable = require('../../models/livrable.model');
const Evaluation = require('../../models/evaluation.model');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { catchAsync } = require('../../utils/catchAsync');
const { validerProjet } = require('../../validations/projet.validation');

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
    projets: catchAsync(async (_, { input = {} }) => {
        const { page = 1, limit = 10, titre, statut, competences, dateDebut, dateFin } = input;
        const query = {};

        if (titre) query.titre = new RegExp(titre, 'i');
        if (statut) query.statut = statut;
        if (competences && competences.length) query.competences = { $all: competences };

        if (dateDebut || dateFin) {
            query.dateDebut = {};
            if (dateDebut) query.dateDebut.$gte = new Date(dateDebut);
            if (dateFin) query.dateDebut.$lte = new Date(dateFin);
        }

        const projets = await Projet.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ creeLe: -1 })
            .populate('equipe')
            .populate('tuteur')
            .populate('livrables');

        const total = await Projet.countDocuments(query);

        return {
            projets,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    }),

    /**
     * Get a projet by ID
     */
    projet: catchAsync(async (_, { id }) => {
        const projet = await Projet.findById(id)
            .populate('equipe')
            .populate('tuteur')
            .populate('livrables');

        if (!projet) {
            throw new UserInputError('Projet non trouvé');
        }

        return projet;
    }),

    /**
     * Analyze projet risks
     */
    analyserRisquesProjet: async (_, { projetId }, context) => {
        checkAuthorization(context, 'read', 'projets');

        try {
            const projet = await Projet.findById(projetId)
                .populate('livrablesComplets')
                .populate('equipe', 'nom prenom email');

            if (!projet) {
                throw new AppError(
                    'Projet not found',
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
                recommandations.push('Review projet schedule and adjust deadlines');
            }
            if (risques.progression) {
                recommandations.push('Increase resources allocated to the projet');
            }
            if (risques.livrables) {
                recommandations.push('Schedule a follow-up meeting for late livrables');
            }
            if (risques.equipe) {
                recommandations.push('Strengthen the projet team');
            }

            return {
                ...risques,
                niveauRisque,
                recommandations
            };
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error('Error analyzing projet risks:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                projetId
            });

            throw new AppError(
                'Failed to analyze projet risks',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    },

    getProjetProgress: async (_, { id }, context) => {
        try {
            const projet = await Projet.findById(id);
            if (!projet) throw new Error('Projet not found');
            return projet.progression || 0;
        } catch (error) {
            logger.error(`Error getting projet progress ${id}:`, error);
            throw new Error('Failed to get projet progress');
        }
    },

    getPredictedPerformance: async (_, { id }, context) => {
        try {
            const projet = await Projet.findById(id);
            if (!projet) throw new Error('Projet not found');
            return projet.performancePredite || 0;
        } catch (error) {
            logger.error(`Error getting predicted performance ${id}:`, error);
            throw new Error('Failed to get predicted performance');
        }
    },

    mesProjets: catchAsync(async (_, __, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        return Projet.find({ equipe: utilisateur.id })
            .populate('equipe')
            .populate('tuteur')
            .populate('livrables')
            .sort({ creeLe: -1 });
    }),

    projetsTuteur: catchAsync(async (_, __, { utilisateur }) => {
        if (!utilisateur || utilisateur.role !== 'TUTEUR') {
            throw new AuthenticationError('Non autorisé');
        }

        return Projet.find({ tuteur: utilisateur.id })
            .populate('equipe')
            .populate('tuteur')
            .populate('livrables')
            .sort({ creeLe: -1 });
    })
};

const Mutation = {
    /**
     * Create a new projet
     */
    createProjet: catchAsync(async (_, { input }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const { error } = validerProjet.creer(input);
        if (error) {
            throw new UserInputError(error.details[0].message);
        }

        const projet = await Projet.create({
            ...input,
            equipe: [...input.equipe, utilisateur.id],
            statut: input.statut || Enum.StatutProjet.BROUILLON,
            progression: 0,
            createur: utilisateur._id,
            creeLe: new Date(),
            majLe: new Date()
        });

        return projet.populate('equipe').populate('tuteur');
    }),

    /**
     * Update an existing projet
     */
    updateProjet: catchAsync(async (_, { id, input }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const projet = await Projet.findById(id);
        if (!projet) {
            throw new UserInputError('Projet non trouvé');
        }

        if (!projet.equipe.includes(utilisateur.id) && utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé à modifier ce projet');
        }

        const { error } = validerProjet.mettreAJour(input);
        if (error) {
            throw new UserInputError(error.details[0].message);
        }

        Object.assign(projet, input);
        await projet.save();

        return projet.populate('equipe').populate('tuteur');
    }),

    /**
     * Delete a projet
     */
    deleteProjet: catchAsync(async (_, { id }, { utilisateur }) => {
        if (!utilisateur || utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé');
        }

        const projet = await Projet.findById(id);
        if (!projet) {
            throw new UserInputError('Projet non trouvé');
        }

        await projet.remove();
        return true;
    }),

    ajouterMembreProjet: catchAsync(async (_, { projetId, utilisateurId }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const projet = await Projet.findById(projetId);
        if (!projet) {
            throw new UserInputError('Projet non trouvé');
        }

        if (!projet.equipe.includes(utilisateur.id) && utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé à modifier ce projet');
        }

        if (projet.equipe.includes(utilisateurId)) {
            throw new UserInputError('L\'utilisateur est déjà membre du projet');
        }

        projet.equipe.push(utilisateurId);
        await projet.save();

        return projet.populate('equipe').populate('tuteur');
    }),

    retirerMembreProjet: catchAsync(async (_, { projetId, utilisateurId }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const projet = await Projet.findById(projetId);
        if (!projet) {
            throw new UserInputError('Projet non trouvé');
        }

        if (!projet.equipe.includes(utilisateur.id) && utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé à modifier ce projet');
        }

        if (!projet.equipe.includes(utilisateurId)) {
            throw new UserInputError('L\'utilisateur n\'est pas membre du projet');
        }

        projet.equipe = projet.equipe.filter(id => id.toString() !== utilisateurId);
        await projet.save();

        return projet.populate('equipe').populate('tuteur');
    }),

    changerStatutProjet: catchAsync(async (_, { id, statut }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const projet = await Projet.findById(id);
        if (!projet) {
            throw new UserInputError('Projet non trouvé');
        }

        if (!projet.equipe.includes(utilisateur.id) && utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé à modifier ce projet');
        }

        projet.statut = statut;
        await projet.save();

        return projet.populate('equipe').populate('tuteur');
    })
};

// Resolvers pour les champs complexes du type Projet
const ProjetResolver = {
    equipe: async (parent) => {
        return parent.populate('equipe').then(p => p.equipe);
    },
    tuteur: async (parent) => {
        return parent.populate('tuteur').then(p => p.tuteur);
    },
    livrables: async (parent) => {
        return parent.populate('livrables').then(p => p.livrables);
    },
    evaluations: async (parent, _, context) => {
        if (!parent.evaluations || parent.evaluations.length === 0) return [];
        try {
            const evaluations = await context.loaders.evaluationLoader.loadMany(
                parent.evaluations.map(id => id.toString())
            );
            return evaluations.filter(Boolean);
        } catch (error) {
            logger.error(`Error loading evaluations for projet ${parent.id}:`, error);
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