const { Sujet } = require('../models/forum.model');
const logger = require('../utils/logger');
const { formatForumResponse } = require('../utils/formatters');

/**
 * Crée un nouveau sujet
 * @param {Object} data - Données du sujet à créer
 * @returns {Promise<Object>} - Sujet créé
 */
async function creerSujet(data) {
    try {
        const sujet = new Sujet(data);
        const sujetSauvegarde = await sujet.save();
        return formatForumResponse(sujetSauvegarde);
    } catch (error) {
        logger.error(`Erreur lors de la création du sujet: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Récupère tous les sujets avec pagination et filtres
 * @param {Object} options - Options de filtrage et pagination
 * @returns {Promise<Object>} - Liste des sujets et métadonnées
 */
async function recupererSujets(options = {}) {
    const {
        page = 1,
        limite = 10,
        categorie,
        recherche,
        auteur,
        estResolu,
        tri = 'recent',
    } = options;

    try {
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
            sujets,
            page,
            totalPages: Math.ceil(total / limite),
            total,
        };
    } catch (error) {
        logger.error(`Erreur lors de la récupération des sujets: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Récupère un sujet par son ID
 * @param {string} id - ID du sujet
 * @returns {Promise<Object>} - Sujet trouvé
 */
async function recupererSujetParId(id) {
    try {
        const sujet = await Sujet.findById(id)
            .populate('auteur', 'nom prenom avatar')
            .populate('reponses.auteur', 'nom prenom avatar')
            .lean();

        if (!sujet) {
            throw new Error('Sujet non trouvé');
        }

        // Incrémenter le compteur de vues
        await Sujet.findByIdAndUpdate(id, { $inc: { vues: 1 } });

        return sujet;
    } catch (error) {
        logger.error(`Erreur lors de la récupération du sujet: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Met à jour un sujet
 * @param {string} id - ID du sujet
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} - Sujet mis à jour
 */
async function mettreAJourSujet(id, data) {
    try {
        const sujet = await Sujet.findByIdAndUpdate(
            id,
            { ...data, majLe: new Date() },
            { new: true, runValidators: true }
        );

        if (!sujet) {
            throw new Error('Sujet non trouvé');
        }

        return sujet;
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour du sujet: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Supprime un sujet
 * @param {string} id - ID du sujet
 * @returns {Promise<boolean>} - Succès de la suppression
 */
async function supprimerSujet(id) {
    try {
        const sujet = await Sujet.findByIdAndDelete(id);
        if (!sujet) {
            throw new Error('Sujet non trouvé');
        }
        return true;
    } catch (error) {
        logger.error(`Erreur lors de la suppression du sujet: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Ajoute une réponse à un sujet
 * @param {string} sujetId - ID du sujet
 * @param {Object} data - Données de la réponse
 * @returns {Promise<Object>} - Réponse ajoutée
 */
async function ajouterReponse(sujetId, data) {
    try {
        const sujet = await Sujet.findById(sujetId);
        if (!sujet) {
            throw new Error('Sujet non trouvé');
        }

        sujet.reponses.push(data);
        await sujet.save();

        return sujet.reponses[sujet.reponses.length - 1];
    } catch (error) {
        logger.error(`Erreur lors de l'ajout de la réponse: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Marque une réponse comme solution
 * @param {string} sujetId - ID du sujet
 * @param {string} reponseId - ID de la réponse
 * @returns {Promise<Object>} - Sujet mis à jour
 */
async function marquerCommeSolution(sujetId, reponseId) {
    try {
        const sujet = await Sujet.findById(sujetId);
        if (!sujet) {
            throw new Error('Sujet non trouvé');
        }

        const reponse = sujet.reponses.id(reponseId);
        if (!reponse) {
            throw new Error('Réponse non trouvée');
        }

        // Retirer le statut de solution des autres réponses
        sujet.reponses.forEach(r => {
            r.estSolution = false;
        });

        reponse.estSolution = true;
        sujet.estResolu = true;
        await sujet.save();

        return sujet;
    } catch (error) {
        logger.error(`Erreur lors du marquage de la solution: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

module.exports = {
    creerSujet,
    recupererSujets,
    recupererSujetParId,
    mettreAJourSujet,
    supprimerSujet,
    ajouterReponse,
    marquerCommeSolution,
};
