/**
 * Fichier central pour les resolvers GraphQL
 * Combine tous les resolvers specifiques en un seul objet
 *
 * @module graphql/resolvers/index
 * @created 2025-05-27 par WalidBenTouhami
 * @updated 2025-05-28 par WalidBenTouhami
 */

'use strict';

const { NODE_ENV } = require('../../config/constants');
const logger = require('../utils/logger');

const resolvers = {
    Query: {
        health: () => ({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            environment: NODE_ENV
        }),
        projets: async (_, __, { models }) => {
            try {
                return await models.Projet.find().sort({ createdAt: -1 });
            } catch (error) {
                logger.error('Erreur lors de la récupération des projets:', error);
                throw error;
            }
        },
        projet: async (_, { id }, { models }) => {
            try {
                return await models.Projet.findById(id);
            } catch (error) {
                logger.error(`Erreur lors de la récupération du projet ${id}:`, error);
                throw error;
            }
        },
        livrables: async (_, __, { models }) => {
            try {
                return await models.Livrable.find().sort({ dateEcheance: 1 });
            } catch (error) {
                logger.error('Erreur lors de la récupération des livrables:', error);
                throw error;
            }
        },
        livrable: async (_, { id }, { models }) => {
            try {
                return await models.Livrable.findById(id);
            } catch (error) {
                logger.error(`Erreur lors de la récupération du livrable ${id}:`, error);
                throw error;
            }
        }
    },
    Mutation: {
        createProjet: async (_, { input }, { models }) => {
            try {
                return await models.Projet.create(input);
            } catch (error) {
                logger.error('Erreur lors de la création du projet:', error);
                throw error;
            }
        },
        updateProjet: async (_, { id, input }, { models }) => {
            try {
                return await models.Projet.findByIdAndUpdate(id, input, { new: true });
            } catch (error) {
                logger.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
                throw error;
            }
        },
        deleteProjet: async (_, { id }, { models }) => {
            try {
                await models.Projet.findByIdAndDelete(id);
                return true;
            } catch (error) {
                logger.error(`Erreur lors de la suppression du projet ${id}:`, error);
                throw error;
            }
        },
        createLivrable: async (_, { input }, { models }) => {
            try {
                return await models.Livrable.create(input);
            } catch (error) {
                logger.error('Erreur lors de la création du livrable:', error);
                throw error;
            }
        },
        updateLivrable: async (_, { id, input }, { models }) => {
            try {
                return await models.Livrable.findByIdAndUpdate(id, input, { new: true });
            } catch (error) {
                logger.error(`Erreur lors de la mise à jour du livrable ${id}:`, error);
                throw error;
            }
        },
        deleteLivrable: async (_, { id }, { models }) => {
            try {
                await models.Livrable.findByIdAndDelete(id);
                return true;
            } catch (error) {
                logger.error(`Erreur lors de la suppression du livrable ${id}:`, error);
                throw error;
            }
        }
    },
    Projet: {
        livrables: async (projet, _, { models }) => {
            try {
                return await models.Livrable.find({ projetId: projet.id });
            } catch (error) {
                logger.error(`Erreur lors de la récupération des livrables du projet ${projet.id}:`, error);
                throw error;
            }
        }
    },
    Livrable: {
        projet: async (livrable, _, { models }) => {
            try {
                return await models.Projet.findById(livrable.projetId);
            } catch (error) {
                logger.error(`Erreur lors de la récupération du projet du livrable ${livrable.id}:`, error);
                throw error;
            }
        }
    }
};

module.exports = {
    resolvers
};