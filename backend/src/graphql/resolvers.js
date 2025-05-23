const mongoose = require('mongoose');
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const logger = require('../utils/logger');

/**
 * Transforme un document MongoDB Projet en type GraphQL
 */
function mapProjetMongoVersGraphQL(doc) {
    if (!doc) return null;
    try {
        return {
            _id: doc._id.toString(),
            titre: doc.titre || '',
            description: doc.description || '',
            equipe: Array.isArray(doc.equipe) ? doc.equipe.map(id => id?.toString() || '') : [],
            tuteur: doc.tuteur?.toString() || null,
            competences: Array.isArray(doc.competences) ? doc.competences : [],
            dateDebut: doc.dateDebut || null,
            dateFin: doc.dateFin || null,
            livrables: Array.isArray(doc.livrables) ? doc.livrables.map(id => id?.toString() || '') : [],
            statut: doc.statut || 'EN_COURS',
            creeLe: doc.creeLe || new Date(),
            majLe: doc.majLe || new Date(),
        };
    } catch (error) {
        logger.error('Erreur lors du mapping Projet:', error);
        return null;
    }
}

/**
 * Transforme un document MongoDB Livrable en type GraphQL
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
        };
    } catch (error) {
        logger.error('Erreur lors du mapping Livrable:', error);
        return null;
    }
}

const resolvers = {
    Query: {
        projets: async () => {
            try {
                const projets = await Projet.find().populate('equipe tuteur livrables');
                return projets.map(mapProjetMongoVersGraphQL);
            } catch (error) {
                logger.error('Erreur lors de la récupération des projets:', error);
                throw new Error('Impossible de récupérer les projets');
            }
        },
        projet: async (_, { id }) => {
            try {
                const projet = await Projet.findById(id).populate('equipe tuteur livrables');
                return mapProjetMongoVersGraphQL(projet);
            } catch (error) {
                logger.error(`Erreur lors de la récupération du projet ${id}:`, error);
                throw new Error('Projet non trouvé');
            }
        },
        livrables: async (_, { projetId }) => {
            try {
                const livrables = await Livrable.find({ projetId });
                return livrables.map(mapLivrableMongoVersGraphQL);
            } catch (error) {
                logger.error(`Erreur lors de la récupération des livrables du projet ${projetId}:`, error);
                throw new Error('Impossible de récupérer les livrables');
            }
        },
        livrable: async (_, { id }) => {
            try {
                const livrable = await Livrable.findById(id);
                return mapLivrableMongoVersGraphQL(livrable);
            } catch (error) {
                logger.error(`Erreur lors de la récupération du livrable ${id}:`, error);
                throw new Error('Livrable non trouvé');
            }
        },
    },
    Mutation: {
        creerProjet: async (_, args) => {
            const session = await mongoose.startSession();
            try {
                session.startTransaction();
                const projet = new Projet({
                    ...args,
                    creeLe: new Date(),
                    majLe: new Date()
                });
                const saved = await projet.save({ session });
                await session.commitTransaction();
                return mapProjetMongoVersGraphQL(saved);
            } catch (error) {
                await session.abortTransaction();
                logger.error('Erreur lors de la création du projet:', error);
                throw new Error('Impossible de créer le projet');
            } finally {
                session.endSession();
            }
        },
        mettreAJourProjet: async (_, { id, ...args }) => {
            try {
                const maj = await Projet.findByIdAndUpdate(
                    id,
                    {
                        ...args,
                        majLe: new Date()
                    },
                    { new: true, runValidators: true }
                ).populate('equipe tuteur livrables');

                if (!maj) throw new Error('Projet non trouvé');
                return mapProjetMongoVersGraphQL(maj);
            } catch (error) {
                logger.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
                throw new Error('Impossible de mettre à jour le projet');
            }
        },
        supprimerProjet: async (_, { id }) => {
            const session = await mongoose.startSession();
            try {
                session.startTransaction();
                const supprime = await Projet.findByIdAndDelete(id, { session });
                if (!supprime) throw new Error('Projet non trouvé');

                // Supprimer également les livrables associés
                await Livrable.deleteMany({ projetId: id }, { session });

                await session.commitTransaction();
                return mapProjetMongoVersGraphQL(supprime);
            } catch (error) {
                await session.abortTransaction();
                logger.error(`Erreur lors de la suppression du projet ${id}:`, error);
                throw new Error('Impossible de supprimer le projet');
            } finally {
                session.endSession();
            }
        },
        ajouterLivrable: async (_, { projetId, input }) => {
            const session = await mongoose.startSession();
            try {
                session.startTransaction();

                // Vérifier si le projet existe
                const projet = await Projet.findById(projetId, null, { session });
                if (!projet) throw new Error('Projet non trouvé');

                const livrable = new Livrable({
                    ...input,
                    projetId,
                    creeLe: new Date(),
                    majLe: new Date()
                });

                const saved = await livrable.save({ session });
                await Projet.findByIdAndUpdate(
                    projetId,
                    { $push: { livrables: saved._id }, majLe: new Date() },
                    { session }
                );

                await session.commitTransaction();
                return mapLivrableMongoVersGraphQL(saved);
            } catch (error) {
                await session.abortTransaction();
                logger.error(`Erreur lors de l'ajout du livrable au projet ${projetId}:`, error);
                throw new Error('Impossible d\'ajouter le livrable');
            } finally {
                session.endSession();
            }
        },
        mettreAJourLivrable: async (_, { livrableId, input }) => {
            try {
                const maj = await Livrable.findByIdAndUpdate(
                    livrableId,
                    {
                        ...input,
                        majLe: new Date()
                    },
                    { new: true, runValidators: true }
                );

                if (!maj) throw new Error('Livrable non trouvé');
                return mapLivrableMongoVersGraphQL(maj);
            } catch (error) {
                logger.error(`Erreur lors de la mise à jour du livrable ${livrableId}:`, error);
                throw new Error('Impossible de mettre à jour le livrable');
            }
        },
        supprimerLivrable: async (_, { livrableId }) => {
            const session = await mongoose.startSession();
            try {
                session.startTransaction();

                const livrable = await Livrable.findById(livrableId, null, { session });
                if (!livrable) throw new Error('Livrable non trouvé');

                const supprime = await Livrable.findByIdAndDelete(livrableId, { session });

                // Retirer la référence du livrable dans le projet
                await Projet.findByIdAndUpdate(
                    livrable.projetId,
                    { $pull: { livrables: livrableId }, majLe: new Date() },
                    { session }
                );

                await session.commitTransaction();
                return mapLivrableMongoVersGraphQL(supprime);
            } catch (error) {
                await session.abortTransaction();
                logger.error(`Erreur lors de la suppression du livrable ${livrableId}:`, error);
                throw new Error('Impossible de supprimer le livrable');
            } finally {
                session.endSession();
            }
        },
    },
    Projet: {
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
                logger.error('Erreur lors du calcul de la progression:', error);
                return null;
            }
        },
    },
};

// Exporter l'objet resolvers pour compatibilité avec la structure d'import dans server.js
module.exports = { resolvers };