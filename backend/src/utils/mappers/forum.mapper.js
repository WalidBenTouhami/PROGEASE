/**
 * Fonctions de mappage pour le forum
 * @module utils/mappers/forum
 */

'use strict';

const Forum = require('../forum.class');

/**
 * Mappe un document MongoDB vers un objet Forum
 * @param {Object} doc - Document MongoDB
 * @returns {Forum} - Instance de la classe Forum
 */
function mapperMongoVersForum(doc) {
    if (!doc) return null;

    const forum = new Forum(doc._id, doc.titre, doc.contenu, doc.categorie, doc.auteur);

    forum.reponses = doc.reponses || [];
    forum.vues = doc.vues || 0;
    forum.votes = doc.votes || { positifs: [], negatifs: [] };
    forum.estResolu = doc.estResolu || false;
    forum.creeLe = doc.creeLe || new Date();
    forum.majLe = doc.majLe || new Date();

    return forum;
}

/**
 * Mappe un objet Forum vers un document MongoDB
 * @param {Forum} forum - Instance de la classe Forum
 * @returns {Object} - Document pour MongoDB
 */
function mapperForumVersMongo(forum) {
    return {
        titre: forum.titre,
        contenu: forum.contenu,
        categorie: forum.categorie,
        auteur: forum.auteur,
        reponses: forum.reponses,
        vues: forum.vues,
        votes: forum.votes,
        estResolu: forum.estResolu,
        creeLe: forum.creeLe,
        majLe: forum.majLe,
    };
}

/**
 * Mappe un document MongoDB vers une réponse API
 * @param {Object} doc - Document MongoDB
 * @returns {Object} - Réponse API
 */
function mapperMongoVersAPI(doc) {
    if (!doc) return null;

    return {
        id: doc._id.toString(),
        titre: doc.titre,
        contenu: doc.contenu,
        categorie: doc.categorie,
        auteur: {
            id: doc.auteur._id.toString(),
            nom: doc.auteur.nom,
            prenom: doc.auteur.prenom,
            avatar: doc.auteur.avatar,
        },
        reponses: (doc.reponses || []).map(reponse => ({
            id: reponse._id.toString(),
            contenu: reponse.contenu,
            auteur: {
                id: reponse.auteur._id.toString(),
                nom: reponse.auteur.nom,
                prenom: reponse.auteur.prenom,
                avatar: reponse.auteur.avatar,
            },
            estSolution: reponse.estSolution || false,
            votes: {
                positifs: reponse.votes?.positifs?.length || 0,
                negatifs: reponse.votes?.negatifs?.length || 0,
                score:
                    (reponse.votes?.positifs?.length || 0) - (reponse.votes?.negatifs?.length || 0),
            },
            creeLe: reponse.creeLe,
            majLe: reponse.majLe,
        })),
        vues: doc.vues || 0,
        votes: {
            positifs: doc.votes?.positifs?.length || 0,
            negatifs: doc.votes?.negatifs?.length || 0,
            score: (doc.votes?.positifs?.length || 0) - (doc.votes?.negatifs?.length || 0),
        },
        estResolu: doc.estResolu || false,
        creeLe: doc.creeLe,
        majLe: doc.majLe,
        stats: {
            nombreReponses: doc.reponses?.length || 0,
            derniereMaj: doc.reponses?.length
                ? Math.max(...doc.reponses.map(r => new Date(r.majLe).getTime()))
                : new Date(doc.majLe).getTime(),
        },
    };
}

/**
 * Mappe un document MongoDB vers une réponse GraphQL
 * @param {Object} doc - Document MongoDB
 * @returns {Object} - Réponse GraphQL
 */
function mapperMongoVersGraphQL(doc) {
    if (!doc) return null;

    return {
        id: doc._id.toString(),
        titre: doc.titre || '',
        contenu: doc.contenu || '',
        categorie: doc.categorie || 'GENERAL',
        auteur: doc.auteur,
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
        vues: doc.vues || 0,
        votes: {
            positifs: doc.votes?.positifs || [],
            negatifs: doc.votes?.negatifs || [],
        },
        estResolu: doc.estResolu || false,
        creeLe: doc.creeLe,
        majLe: doc.majLe,
    };
}

module.exports = {
    mapperMongoVersForum,
    mapperForumVersMongo,
    mapperMongoVersAPI,
    mapperMongoVersGraphQL,
};
