/**
 * Resolvers GraphQL pour les livrables
 *
 * @module graphql/resolvers/livrable
 * @created 2025-05-27 par WalidBenTouhami
 */

'use strict';

const mongoose = require('mongoose');
const Livrable = require('../../models/livrable.model');
const Projet = require('../../models/projet.model');
const logger = require('../../utils/logger');
const { AppError, ERROR_CODES } = require('../../middlewares/errorHandlers');
const { validateInput } = require('../../utils/validators');
const { handleMongooseError } = require('../../utils/errorUtils');
const { Enums } = require('../../../config/constants');
const { mapProjetMongoVersGraphQL } = require('./projet.resolver');
const { checkAuthorization } = require('../../utils/auth.utils');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { catchAsync } = require('../../utils/catchAsync');
const { validerLivrable } = require('../../validations/livrable.validation');

/**
 * Transforme un document MongoDB Livrable en type GraphQL
 * @param {mongoose.Document} doc - Document MongoDB
 * @returns {Object|null} - Objet formate pour GraphQL
 */
function mapLivrableMongoVersGraphQL(doc) {
    if (!doc) return null;
    try {
        return {
            id: doc._id.toString(),
            intitule: doc.intitule || '',
            description: doc.description || '',
            dateLimite: doc.dateLimite || null,
            urlDepot: doc.urlDepot || '',
            statut: doc.statut || Enums.StatutLivrable.EN_ATTENTE,
            projetId: doc.projetId?.toString() || '',
            creeLe: doc.creeLe || new Date(),
            majLe: doc.majLe || new Date(),
            estEnRetard: doc.estEnRetard || false
        };
    } catch (error) {
        logger.error('Error mapping livrable:', {
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
    livrables: catchAsync(async (_, { input = {} }) => {
        const { page = 1, limit = 10, projetId, type, statut, estEnRetard } = input;
        const query = {};

        if (projetId) query.projetId = projetId;
        if (type) query.type = type;
        if (statut) query.statut = statut;
        if (estEnRetard !== undefined) {
            query.dateLimite = { $lt: new Date() };
            query.statut = { $ne: 'TERMINE' };
        }

        const livrables = await Livrable.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ dateLimite: 1 })
            .populate('projet')
            .populate('commentaires.auteur');

        const total = await Livrable.countDocuments(query);

        return {
            livrables,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    }),

    /**
     * Get a livrable by ID
     */
    livrable: catchAsync(async (_, { id }) => {
        const livrable = await Livrable.findById(id)
            .populate('projet')
            .populate('commentaires.auteur');

        if (!livrable) {
            throw new UserInputError('Livrable non trouvé');
        }

        return livrable;
    }),

    /**
     * Get livrables by projet ID
     */
    livrablesByProjet: catchAsync(async (_, { projetId }) => {
        const livrables = await Livrable.find({ projetId })
            .sort({ dateLimite: 1 })
            .populate('projet')
            .populate('commentaires.auteur');

        return livrables;
    })
};

const Mutation = {
    /**
     * Créer un nouveau livrable
     */
    creerLivrable: catchAsync(async (_, { input }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const projet = await Projet.findById(input.projetId);
        if (!projet) {
            throw new UserInputError('Projet non trouvé');
        }

        if (!projet.equipe.includes(utilisateur.id) && utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé à créer un livrable pour ce projet');
        }

        const { error } = validerLivrable.creer(input);
        if (error) {
            throw new UserInputError(error.details[0].message);
        }

        const livrable = await Livrable.create(input);
        return livrable.populate('projet');
    }),

    /**
     * Mettre à jour un livrable
     */
    mettreAJourLivrable: catchAsync(async (_, { id, input }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const livrable = await Livrable.findById(id);
        if (!livrable) {
            throw new UserInputError('Livrable non trouvé');
        }

        const projet = await Projet.findById(livrable.projetId);
        if (!projet.equipe.includes(utilisateur.id) && utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé à modifier ce livrable');
        }

        const { error } = validerLivrable.mettreAJour(input);
        if (error) {
            throw new UserInputError(error.details[0].message);
        }

        Object.assign(livrable, input);
        await livrable.save();

        return livrable.populate('projet').populate('commentaires.auteur');
    }),

    /**
     * Supprimer un livrable
     */
    supprimerLivrable: catchAsync(async (_, { id }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const livrable = await Livrable.findById(id);
        if (!livrable) {
            throw new UserInputError('Livrable non trouvé');
        }

        const projet = await Projet.findById(livrable.projetId);
        if (!projet.equipe.includes(utilisateur.id) && utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé à supprimer ce livrable');
        }

        await livrable.remove();
        return true;
    }),

    ajouterFichier: catchAsync(async (_, { id, fichier }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const livrable = await Livrable.findById(id);
        if (!livrable) {
            throw new UserInputError('Livrable non trouvé');
        }

        const projet = await Projet.findById(livrable.projetId);
        if (!projet.equipe.includes(utilisateur.id) && utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé à modifier ce livrable');
        }

        livrable.fichiers.push({
            ...fichier,
            dateUpload: new Date()
        });

        await livrable.save();
        return livrable.populate('projet').populate('commentaires.auteur');
    }),

    supprimerFichier: catchAsync(async (_, { id, nomFichier }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const livrable = await Livrable.findById(id);
        if (!livrable) {
            throw new UserInputError('Livrable non trouvé');
        }

        const projet = await Projet.findById(livrable.projetId);
        if (!projet.equipe.includes(utilisateur.id) && utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé à modifier ce livrable');
        }

        livrable.fichiers = livrable.fichiers.filter(f => f.nom !== nomFichier);
        await livrable.save();

        return livrable.populate('projet').populate('commentaires.auteur');
    }),

    ajouterCommentaire: catchAsync(async (_, { id, commentaire }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const livrable = await Livrable.findById(id);
        if (!livrable) {
            throw new UserInputError('Livrable non trouvé');
        }

        livrable.commentaires.push({
            auteur: utilisateur.id,
            contenu: commentaire.contenu,
            dateCreation: new Date()
        });

        await livrable.save();
        return livrable.populate('projet').populate('commentaires.auteur');
    }),

    supprimerCommentaire: catchAsync(async (_, { id, commentaireId }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const livrable = await Livrable.findById(id);
        if (!livrable) {
            throw new UserInputError('Livrable non trouvé');
        }

        const commentaire = livrable.commentaires.id(commentaireId);
        if (!commentaire) {
            throw new UserInputError('Commentaire non trouvé');
        }

        if (commentaire.auteur.toString() !== utilisateur.id && utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé à supprimer ce commentaire');
        }

        commentaire.remove();
        await livrable.save();

        return livrable.populate('projet').populate('commentaires.auteur');
    }),

    changerStatutLivrable: catchAsync(async (_, { id, statut }, { utilisateur }) => {
        if (!utilisateur) {
            throw new AuthenticationError('Non authentifié');
        }

        const livrable = await Livrable.findById(id);
        if (!livrable) {
            throw new UserInputError('Livrable non trouvé');
        }

        const projet = await Projet.findById(livrable.projetId);
        if (!projet.equipe.includes(utilisateur.id) && utilisateur.role !== 'ADMIN') {
            throw new AuthenticationError('Non autorisé à modifier ce livrable');
        }

        livrable.statut = statut;
        await livrable.save();

        return livrable.populate('projet').populate('commentaires.auteur');
    })
};

module.exports = {
    Query,
    Mutation
};