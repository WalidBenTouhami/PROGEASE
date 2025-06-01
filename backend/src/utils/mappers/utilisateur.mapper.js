/**
 * Fonctions de mappage pour les utilisateurs
 * @module utils/mappers/utilisateur
 */

'use strict';

const Utilisateur = require('../utilisateur.class');

/**
 * Mappe un document MongoDB vers un objet Utilisateur
 * @param {Object} doc - Document MongoDB
 * @returns {Utilisateur} - Instance de la classe Utilisateur
 */
function mapperMongoVersUtilisateur(doc) {
    if (!doc) return null;

    const utilisateur = new Utilisateur(
        doc._id,
        doc.nom,
        doc.prenom,
        doc.email,
        doc.roles
    );

    utilisateur.telephone = doc.telephone;
    utilisateur.dateNaissance = doc.dateNaissance;
    utilisateur.avatar = doc.avatar;
    utilisateur.bio = doc.bio;
    utilisateur.statut = doc.statut;
    utilisateur.dernierConnexion = doc.dernierConnexion;
    utilisateur.creeLe = doc.creeLe;
    utilisateur.majLe = doc.majLe;
    utilisateur.tentativesConnexion = doc.tentativesConnexion;
    utilisateur.verrouilleJusqua = doc.verrouilleJusqua;

    return utilisateur;
}

/**
 * Mappe un objet Utilisateur vers un document MongoDB
 * @param {Utilisateur} utilisateur - Instance de la classe Utilisateur
 * @returns {Object} - Document pour MongoDB
 */
function mapperUtilisateurVersMongo(utilisateur) {
    return {
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        telephone: utilisateur.telephone,
        dateNaissance: utilisateur.dateNaissance,
        avatar: utilisateur.avatar,
        bio: utilisateur.bio,
        roles: utilisateur.roles,
        statut: utilisateur.statut,
        dernierConnexion: utilisateur.dernierConnexion,
        creeLe: utilisateur.creeLe,
        majLe: utilisateur.majLe,
        tentativesConnexion: utilisateur.tentativesConnexion,
        verrouilleJusqua: utilisateur.verrouilleJusqua
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
        nom: doc.nom,
        prenom: doc.prenom,
        email: doc.email,
        telephone: doc.telephone,
        dateNaissance: doc.dateNaissance ? doc.dateNaissance.toISOString() : null,
        avatar: doc.avatar,
        bio: doc.bio,
        roles: doc.roles,
        statut: doc.statut,
        dernierConnexion: doc.dernierConnexion ? doc.dernierConnexion.toISOString() : null,
        creeLe: doc.creeLe.toISOString(),
        majLe: doc.majLe.toISOString(),
        stats: {
            estActif: doc.statut === 'ACTIF',
            estVerrouille: doc.verrouilleJusqua && new Date() < new Date(doc.verrouilleJusqua),
            tentativesConnexion: doc.tentativesConnexion || 0,
            verrouilleJusqua: doc.verrouilleJusqua ? doc.verrouilleJusqua.toISOString() : null
        }
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
        majLe: doc.majLe ? doc.majLe.toISOString() : null
    };
}

module.exports = {
    mapperMongoVersUtilisateur,
    mapperUtilisateurVersMongo,
    mapperMongoVersAPI,
    mapperMongoVersGraphQL
}; 