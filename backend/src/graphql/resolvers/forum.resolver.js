/**
 * Resolvers GraphQL pour le forum
 *
 * @module graphql/resolvers/forum
 * @created 2025-06-01 par WalidBenTouhami
 */

'use strict';

const mongoose = require('mongoose');
const { Sujet } = require('../../models/forum.model');
const logger = require('../../utils/logger');
const { AppError, ERROR_CODES } = require('../../middlewares/errorHandlers');
const { validateInput } = require('../../utils/validators');
const { handleMongooseError } = require('../../utils/errorUtils');
const { checkAuthorization } = require('../../utils/auth.utils');

/**
 * Transforme un document MongoDB Sujet en type GraphQL
 * @param {mongoose.Document} doc - Document MongoDB
 * @returns {Object|null} - Objet formaté pour GraphQL
 */
function mapSujetMongoVersGraphQL(doc) {
    if (!doc) return null;
    return {
        id: doc._id.toString(),
        titre: doc.titre || '',
        contenu: doc.contenu || '',
        categorie: doc.categorie || 'GENERAL',
        tags: doc.tags || [],
        auteur: doc.auteur,
        vues: doc.vues || 0,
        estResolu: doc.estResolu || false,
        votes: {
            positifs: doc.votes?.positifs || [],
            negatifs: doc.votes?.negatifs || [],
        },
        reponses: (doc.reponses || []).map(reponse => ({
            id: reponse._id.toString(),
            contenu: reponse.contenu,
            auteur: reponse.auteur,
            estSolution: reponse.estSolution || false,
            votes: {
                positifs: reponse.votes?.positifs || [],
                negatifs: reponse.votes?.negatifs || [],
            },
            creeLe: reponse.creeLe,
            majLe: reponse.majLe,
        })),
        creeLe: doc.creeLe,
        majLe: doc.majLe,
    };
}

const Query = {
    /**
     * Récupère tous les sujets avec pagination et filtres
     */
    sujets: async (_parent, { input = {} }, _context) => {
        try {
            const {
                page = 1,
                limite = 10,
                categorie,
                recherche,
                auteur,
                estResolu,
                tri = 'recent',
            } = input;

            const query = {};
            if (categorie) query.categorie = categorie;
            if (auteur) query.auteur = auteur;
            if (estResolu !== undefined) query.estResolu = estResolu;
            if (recherche) {
                query.$text = { $search: recherche };
            }

            const skip = (page - 1) * limite;
            let sort = {};
            switch (tri) {
            case 'recent':
                sort = { creeLe: -1 };
                break;
            case 'populaire':
                sort = { vues: -1 };
                break;
            case 'reponses':
                sort = { 'reponses.length': -1 };
                break;
            default:
                sort = { creeLe: -1 };
            }

            const [sujets, total] = await Promise.all([
                Sujet.find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(limite)
                    .populate('auteur', 'nom prenom avatar')
                    .lean(),
                Sujet.countDocuments(query),
            ]);

            return {
                sujets: sujets.map(mapSujetMongoVersGraphQL),
                page,
                totalPages: Math.ceil(total / limite),
                total,
            };
        } catch (error) {
            logger.error('Erreur lors de la récupération des sujets:', error);
            throw handleMongooseError(error);
        }
    },

    /**
     * Récupère un sujet par son ID
     */
    sujet: async (_, { id }, context) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError('ID de sujet invalide', 400, ERROR_CODES.BAD_REQUEST, true);
            }

            const sujet = await Sujet.findById(id)
                .populate('auteur', 'nom prenom avatar')
                .populate('reponses.auteur', 'nom prenom avatar')
                .lean();

            if (!sujet) {
                throw new AppError('Sujet non trouvé', 404, ERROR_CODES.NOT_FOUND, true);
            }

            // Incrémenter le compteur de vues
            await Sujet.findByIdAndUpdate(id, { $inc: { vues: 1 } });

            return mapSujetMongoVersGraphQL(sujet);
        } catch (error) {
            logger.error('Erreur lors de la récupération du sujet:', error);
            throw handleMongooseError(error);
        }
    },
};

const Mutation = {
    /**
     * Crée un nouveau sujet
     */
    creerSujet: async (_, { input }, context) => {
        checkAuthorization(context, 'create', 'forum');

        try {
            validateInput(input, {
                titre: { required: true, type: 'string', minLength: 5 },
                contenu: { required: true, type: 'string', minLength: 20 },
                categorie: {
                    required: true,
                    type: 'string',
                    enum: ['GENERAL', 'TECHNIQUE', 'PROJET', 'FORMATION', 'AIDE', 'AUTRE'],
                },
                tags: { type: 'array', itemType: 'string' },
            });

            const sujet = new Sujet({
                ...input,
                auteur: context.utilisateur._id,
                creeLe: new Date(),
                majLe: new Date(),
            });

            const saved = await sujet.save();

            logger.info(`Sujet créé: ${saved._id}`, {
                utilisateurId: context.utilisateur._id,
                requestId: context.requestId,
            });

            return mapSujetMongoVersGraphQL(saved);
        } catch (error) {
            logger.error('Erreur lors de la création du sujet:', error);
            throw handleMongooseError(error);
        }
    },

    /**
     * Met à jour un sujet
     */
    mettreAJourSujet: async (_, { id, input }, context) => {
        checkAuthorization(context, 'update', 'forum');

        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError('ID de sujet invalide', 400, ERROR_CODES.BAD_REQUEST, true);
            }

            const sujet = await Sujet.findById(id);
            if (!sujet) {
                throw new AppError('Sujet non trouvé', 404, ERROR_CODES.NOT_FOUND, true);
            }

            if (sujet.auteur.toString() !== context.utilisateur._id.toString()) {
                throw new AppError(
                    'Non autorisé à modifier ce sujet',
                    403,
                    ERROR_CODES.FORBIDDEN,
                    true
                );
            }

            const updateData = {
                ...input,
                majLe: new Date(),
            };

            const updated = await Sujet.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            }).populate('auteur', 'nom prenom avatar');

            return mapSujetMongoVersGraphQL(updated);
        } catch (error) {
            logger.error('Erreur lors de la mise à jour du sujet:', error);
            throw handleMongooseError(error);
        }
    },

    /**
     * Supprime un sujet
     */
    supprimerSujet: async (_, { id }, context) => {
        checkAuthorization(context, 'delete', 'forum');

        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError('ID de sujet invalide', 400, ERROR_CODES.BAD_REQUEST, true);
            }

            const sujet = await Sujet.findById(id);
            if (!sujet) {
                throw new AppError('Sujet non trouvé', 404, ERROR_CODES.NOT_FOUND, true);
            }

            if (sujet.auteur.toString() !== context.utilisateur._id.toString()) {
                throw new AppError(
                    'Non autorisé à supprimer ce sujet',
                    403,
                    ERROR_CODES.FORBIDDEN,
                    true
                );
            }

            await Sujet.findByIdAndDelete(id);

            return true;
        } catch (error) {
            logger.error('Erreur lors de la suppression du sujet:', error);
            throw handleMongooseError(error);
        }
    },

    /**
     * Ajoute une réponse à un sujet
     */
    ajouterReponse: async (_, { sujetId, input }, context) => {
        checkAuthorization(context, 'create', 'forum');

        try {
            if (!mongoose.Types.ObjectId.isValid(sujetId)) {
                throw new AppError('ID de sujet invalide', 400, ERROR_CODES.BAD_REQUEST, true);
            }

            validateInput(input, {
                contenu: { required: true, type: 'string', minLength: 10 },
            });

            const sujet = await Sujet.findById(sujetId);
            if (!sujet) {
                throw new AppError('Sujet non trouvé', 404, ERROR_CODES.NOT_FOUND, true);
            }

            const reponse = {
                contenu: input.contenu,
                auteur: context.utilisateur._id,
                creeLe: new Date(),
                majLe: new Date(),
            };

            sujet.reponses.push(reponse);
            await sujet.save();

            const nouvelleReponse = sujet.reponses[sujet.reponses.length - 1];
            return {
                ...mapSujetMongoVersGraphQL(sujet),
                reponseAjoutee: nouvelleReponse,
            };
        } catch (error) {
            logger.error('Erreur lors de l\'ajout de la réponse:', error);
            throw handleMongooseError(error);
        }
    },

    /**
     * Marque une réponse comme solution
     */
    marquerCommeSolution: async (_, { sujetId, reponseId }, context) => {
        checkAuthorization(context, 'update', 'forum');

        try {
            if (
                !mongoose.Types.ObjectId.isValid(sujetId) ||
                !mongoose.Types.ObjectId.isValid(reponseId)
            ) {
                throw new AppError('ID invalide', 400, ERROR_CODES.BAD_REQUEST, true);
            }

            const sujet = await Sujet.findById(sujetId);
            if (!sujet) {
                throw new AppError('Sujet non trouvé', 404, ERROR_CODES.NOT_FOUND, true);
            }

            if (sujet.auteur.toString() !== context.utilisateur._id.toString()) {
                throw new AppError(
                    'Non autorisé à marquer la solution',
                    403,
                    ERROR_CODES.FORBIDDEN,
                    true
                );
            }

            const reponse = sujet.reponses.id(reponseId);
            if (!reponse) {
                throw new AppError('Réponse non trouvée', 404, ERROR_CODES.NOT_FOUND, true);
            }

            // Retirer le statut de solution des autres réponses
            sujet.reponses.forEach(r => {
                r.estSolution = false;
            });

            reponse.estSolution = true;
            sujet.estResolu = true;
            await sujet.save();

            return mapSujetMongoVersGraphQL(sujet);
        } catch (error) {
            logger.error('Erreur lors du marquage de la solution:', error);
            throw handleMongooseError(error);
        }
    },
};

module.exports = {
    Query,
    Mutation,
};
