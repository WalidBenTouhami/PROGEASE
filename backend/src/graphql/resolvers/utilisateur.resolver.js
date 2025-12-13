/**
 * Resolvers GraphQL pour les utilisateurs
 *
 * @module graphql/resolvers/utilisateur
 * @created 2025-06-01 par WalidBenTouhami
 */

'use strict';

const mongoose = require('mongoose');
const Utilisateur = require('../../models/utilisateur.model');
const logger = require('../../utils/logger');
const { AppError, ERROR_CODES } = require('../../middlewares/errorHandlers');
const { validateInput } = require('../../utils/validators');
const { handleMongooseError } = require('../../utils/errorUtils');
const { checkAuthorization } = require('../../utils/auth.utils');
const { formatUtilisateurResponse } = require('../../utils/formatters');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { catchAsync } = require('../../utils/catchAsync');
const { signToken } = require('../../utils/jwt');
const { validerUtilisateur } = require('../../validations/utilisateur.validation');

/**
 * Transforme un document MongoDB Utilisateur en type GraphQL
 * @param {mongoose.Document} doc - Document MongoDB
 * @returns {Object|null} - Objet formaté pour GraphQL
 */
function mapUtilisateurMongoVersGraphQL(doc) {
    if (!doc) return null;

    return {
        id: doc._id.toString(),
        nom: doc.nom || '',
        prenom: doc.prenom || '',
        email: doc.email || '',
        telephone: doc.telephone || '',
        dateNaissance: doc.dateNaissance ? doc.dateNaissance.toISOString() : null,
        avatar: doc.avatar || '',
        bio: doc.bio || '',
        roles: doc.roles || [],
        statut: doc.statut || 'ACTIF',
        dernierConnexion: doc.dernierConnexion ? doc.dernierConnexion.toISOString() : null,
        creeLe: doc.creeLe ? doc.creeLe.toISOString() : null,
        majLe: doc.majLe ? doc.majLe.toISOString() : null,
    };
}

const resolvers = {
    Query: {
        /**
         * Récupère un utilisateur par son ID
         */
        utilisateur: async (_, { id }, context) => {
            try {
                checkAuthorization(context);
                validateInput({ id }, ['id']);

                const utilisateur = await Utilisateur.findById(id).select('-motDePasse');
                if (!utilisateur) {
                    throw new UserInputError('Utilisateur non trouvé');
                }

                return mapUtilisateurMongoVersGraphQL(utilisateur);
            } catch (error) {
                logger.error('Erreur lors de la récupération de l\'utilisateur:', error);
                throw handleMongooseError(error);
            }
        },

        /**
         * Récupère tous les utilisateurs avec pagination et filtres
         */
        utilisateurs: catchAsync(async (_, { input = {} }) => {
            const { page = 1, limit = 10, recherche, role, estActif } = input;
            const query = {};

            if (recherche) {
                query.$or = [
                    { nom: { $regex: recherche, $options: 'i' } },
                    { prenom: { $regex: recherche, $options: 'i' } },
                    { email: { $regex: recherche, $options: 'i' } },
                ];
            }

            if (role) query.role = role;
            if (estActif !== undefined) query.estActif = estActif;

            const utilisateurs = await Utilisateur.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ creeLe: -1 });

            const total = await Utilisateur.countDocuments(query);

            return {
                utilisateurs,
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        }),

        monProfil: catchAsync(async (_, __, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }
            return Utilisateur.findById(utilisateur.id);
        }),
    },

    Mutation: {
        /**
         * Crée un nouvel utilisateur
         */
        creerUtilisateur: catchAsync(async (_, { input }, { utilisateur }) => {
            if (!utilisateur || utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError('Non autorisé');
            }

            const { error } = validerUtilisateur.creer(input);
            if (error) {
                throw new UserInputError(error.details[0].message);
            }

            const utilisateurExistant = await Utilisateur.findOne({ email: input.email });
            if (utilisateurExistant) {
                throw new UserInputError('Cet email est déjà utilisé');
            }

            const nouvelUtilisateur = await Utilisateur.create(input);
            return nouvelUtilisateur;
        }),

        /**
         * Met à jour un utilisateur
         */
        mettreAJourUtilisateur: catchAsync(async (_, { id, input }, { utilisateur }) => {
            if (!utilisateur || utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError('Non autorisé');
            }

            const { error } = validerUtilisateur.mettreAJour(input);
            if (error) {
                throw new UserInputError(error.details[0].message);
            }

            const utilisateurAMettreAJour = await Utilisateur.findById(id);
            if (!utilisateurAMettreAJour) {
                throw new UserInputError('Utilisateur non trouvé');
            }

            Object.assign(utilisateurAMettreAJour, input);
            await utilisateurAMettreAJour.save();

            return utilisateurAMettreAJour;
        }),

        /**
         * Supprime un utilisateur
         */
        supprimerUtilisateur: catchAsync(async (_, { id }, { utilisateur }) => {
            if (!utilisateur || utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError('Non autorisé');
            }

            const utilisateurASupprimer = await Utilisateur.findById(id);
            if (!utilisateurASupprimer) {
                throw new UserInputError('Utilisateur non trouvé');
            }

            await utilisateurASupprimer.remove();
            return true;
        }),

        inscription: catchAsync(async (_, { input }) => {
            const { error } = validerUtilisateur.creer(input);
            if (error) {
                throw new UserInputError(error.details[0].message);
            }

            const utilisateurExistant = await Utilisateur.findOne({ email: input.email });
            if (utilisateurExistant) {
                throw new UserInputError('Cet email est déjà utilisé');
            }

            const nouvelUtilisateur = await Utilisateur.create({
                ...input,
                role: 'ETUDIANT',
                estActif: true,
                emailVerifie: false,
            });

            const token = signToken(nouvelUtilisateur);

            return {
                token,
                utilisateur: nouvelUtilisateur,
            };
        }),

        connexion: catchAsync(async (_, { email, motDePasse }) => {
            const utilisateur = await Utilisateur.findOne({ email });
            if (!utilisateur || !(await utilisateur.verifierMotDePasse(motDePasse))) {
                throw new AuthenticationError('Email ou mot de passe incorrect');
            }

            if (!utilisateur.estActif) {
                throw new AuthenticationError('Compte désactivé');
            }

            utilisateur.derniereConnexion = new Date();
            await utilisateur.save();

            const token = signToken(utilisateur);

            return {
                token,
                utilisateur,
            };
        }),

        mettreAJourMonProfil: catchAsync(async (_, { input }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            const { error } = validerUtilisateur.mettreAJour(input);
            if (error) {
                throw new UserInputError(error.details[0].message);
            }

            const utilisateurAMettreAJour = await Utilisateur.findById(utilisateur.id);
            Object.assign(utilisateurAMettreAJour, input);
            await utilisateurAMettreAJour.save();

            return utilisateurAMettreAJour;
        }),

        verifierEmail: catchAsync(async (_, { token }) => {
            // TODO: Implémenter la vérification d'email avec le token
            return true;
        }),
    },

    Utilisateur: {
        projets: async parent => {
            return parent.populate('projets').then(u => u.projets);
        },
        formations: async parent => {
            return parent.populate('formations').then(u => u.formations);
        },
        certifications: async parent => {
            return parent.populate('certifications').then(u => u.certifications);
        },
    },
};

module.exports = resolvers;
