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
            statut: doc.statut || Enum.StatutProjet.EN_COURS,
            urlDepot: doc.urlDepot || '',
            progression: doc.progression || 0,
            creeLe: doc.creeLe || new Date(),
            majLe: doc.majLe || new Date(),
            duree: doc.duree || 0,
            estEnRetard: doc.estEnRetard || false,
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

    /**
     * Analyser les risques d'un projet
     */
    analyserRisquesProjet: async (_, { projetId }, context) => {
        checkAuthorization(context, 'read', 'projets');

        try {
            const projet = await Projet.findById(projetId)
                .populate('livrablesComplets')
                .populate('equipe', 'nom prenom email');

            if (!projet) {
                throw new AppError(
                    'Projet non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Analyse des risques basée sur plusieurs facteurs
            const risques = {
                retard: projet.estEnRetard,
                progression: projet.progression < 50 && projet.dateFin < new Date(),
                livrables: projet.livrablesComplets.some(l => l.estEnRetard()),
                equipe: projet.equipe.length < 2
            };

            const niveauRisque = Object.values(risques).filter(Boolean).length;

            const recommandations = [];
            if (risques.retard) {
                recommandations.push('Revoir le planning du projet et ajuster les échéances');
            }
            if (risques.progression) {
                recommandations.push('Augmenter les ressources allouées au projet');
            }
            if (risques.livrables) {
                recommandations.push('Organiser une réunion de suivi des livrables en retard');
            }
            if (risques.equipe) {
                recommandations.push('Renforcer l\'équipe projet');
            }

            return {
                ...risques,
                niveauRisque,
                recommandations
            };
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error('Erreur lors de l\'analyse des risques:', {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId,
                projetId
            });

            throw new AppError(
                'Erreur lors de l\'analyse des risques',
                500,
                ERROR_CODES.SERVER_ERROR,
                false
            );
        }
    }
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
                titre: { required: true, type: 'string', minLength: 5 },
                description: { required: true, type: 'string', minLength: 10 },
                equipe: { type: 'array', itemType: 'string' },
                tuteur: { type: 'string' },
                competences: { required: true, type: 'array', itemType: 'string', minLength: 1 },
                dateDebut: { required: true, type: 'date' },
                dateFin: { required: true, type: 'date' },
                urlDepot: { type: 'string', pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/ }
            });

            // Creer le projet
            const projet = new Projet({
                ...input,
                statut: input.statut || Enum.StatutProjet.BROUILLON,
                progression: 0,
                createur: context.utilisateur?._id,
                creeLe: new Date(),
                majLe: new Date()
            });

            const saved = await projet.save({ session });

            // Ajouter l'activite d'audit
            logger.info(`Projet cree: ${saved._id}`, {
                utilisateurId: context.utilisateur?._id,
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
            if (input.titre) validateInput({ titre: input.titre }, { titre: { type: 'string', minLength: 5 } });
            if (input.description) validateInput({ description: input.description }, { description: { type: 'string', minLength: 10 } });
            if (input.competences) validateInput({ competences: input.competences }, { competences: { type: 'array', itemType: 'string', minLength: 1 } });
            if (input.urlDepot) validateInput({ urlDepot: input.urlDepot }, { urlDepot: { type: 'string', pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/ } });

            const updateData = {
                ...input,
                majLe: new Date(),
                majPar: context.utilisateur?._id
            };

            // Conversion des dates si présentes
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
                    'Projet non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            // Recalculer la progression si nécessaire
            if (input.livrables || input.statut) {
                await projetMisAJour.calculerProgression();
                await projetMisAJour.save({ session });
            }

            await session.commitTransaction();

            // Invalider le cache DataLoader
            context.loaders.projetLoader.clear(id);

            logger.info(`Projet mis à jour: ${id}`, {
                utilisateurId: context.utilisateur?._id,
                requestId: context.requestId
            });

            return mapProjetMongoVersGraphQL(projetMisAJour);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            const appError = handleMongooseError(
                error,
                'Impossible de mettre à jour le projet',
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
     * Supprimer un projet
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

            // Supprimer d'abord les livrables associés
            const Livrable = require('../../models/livrable.model');
            await Livrable.deleteMany({ projetId: id }).session(session);

            const projetSupprime = await Projet.findByIdAndDelete(id).session(session);

            if (!projetSupprime) {
                throw new AppError(
                    'Projet non trouve',
                    404,
                    ERROR_CODES.NOT_FOUND,
                    true
                );
            }

            await session.commitTransaction();

            // Invalider le cache DataLoader
            context.loaders.projetLoader.clear(id);

            logger.info(`Projet supprime: ${id}`, {
                utilisateurId: context.utilisateur?._id,
                requestId: context.requestId
            });

            return mapProjetMongoVersGraphQL(projetSupprime);
        } catch (error) {
            await session.abortTransaction();

            if (error instanceof AppError) throw error;

            logger.error(`Erreur lors de la suppression du projet ${id}:`, {
                error: error.message,
                stack: error.stack,
                requestId: context.requestId
            });

            throw new AppError(
                'Impossible de supprimer le projet',
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