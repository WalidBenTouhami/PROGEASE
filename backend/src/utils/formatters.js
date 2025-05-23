/**
 * @fileoverview Utilitaires de formatage pour convertir les documents MongoDB en objets adaptés à GraphQL et REST
 * Centralise les fonctions de mapping pour éviter la duplication et assurer la cohérence
 */

/**
 * Convertit un document MongoDB Projet en objet compatible GraphQL
 * @param {Object} doc - Document MongoDB du modèle Projet
 * @returns {Object|null} - Objet formaté pour GraphQL ou null si aucun document
 */
function formaterProjetPourGraphQL(doc) {
    if (!doc) return null;
    return {
        _id: doc._id.toString(),
        titre: doc.titre,
        description: doc.description,
        equipe: Array.isArray(doc.equipe) ? doc.equipe.map(id => id.toString()) : [],
        tuteur: doc.tuteur?.toString() || null,
        competences: doc.competences || [],
        dateDebut: doc.dateDebut,
        dateFin: doc.dateFin,
        livrables: Array.isArray(doc.livrables) ? doc.livrables.map(id => id.toString()) : [],
        statut: doc.statut,
        creeLe: doc.creeLe,
        majLe: doc.majLe,
    };
}

/**
 * Convertit un document MongoDB Livrable en objet compatible GraphQL
 * @param {Object} doc - Document MongoDB du modèle Livrable
 * @returns {Object|null} - Objet formaté pour GraphQL ou null si aucun document
 */
function formaterLivrablePourGraphQL(doc) {
    if (!doc) return null;
    return {
        _id: doc._id.toString(),
        nom: doc.nom,
        description: doc.description,
        dateLimite: doc.dateLimite,
        urlDepot: doc.urlDepot,
        statut: doc.statut,
        projetId: doc.projetId?.toString(),
        creeLe: doc.creeLe,
        majLe: doc.majLe,
    };
}

/**
 * Convertit un document MongoDB Projet en objet allégé pour les listes
 * @param {Object} doc - Document MongoDB du modèle Projet
 * @returns {Object|null} - Objet formaté pour les listes ou null si aucun document
 */
function formaterProjetPourListe(doc) {
    if (!doc) return null;
    return {
        _id: doc._id.toString(),
        titre: doc.titre,
        statut: doc.statut,
        dateDebut: doc.dateDebut,
        dateFin: doc.dateFin,
        nombreLivrables: doc.livrables?.length || 0,
        creeLe: doc.creeLe,
    };
}

/**
 * Convertit un document MongoDB Livrable en objet allégé pour les listes
 * @param {Object} doc - Document MongoDB du modèle Livrable
 * @returns {Object|null} - Objet formaté pour les listes ou null si aucun document
 */
function formaterLivrablePourListe(doc) {
    if (!doc) return null;
    return {
        _id: doc._id.toString(),
        nom: doc.nom,
        statut: doc.statut,
        dateLimite: doc.dateLimite,
        projetId: doc.projetId?.toString(),
    };
}

/**
 * Calcule la progression d'un projet en pourcentage
 * @param {Object} projet - Objet projet avec dateDebut et dateFin
 * @returns {Number|null} - Pourcentage de progression ou null si dates invalides
 */
function calculerProgressionProjet(projet) {
    if (!projet.dateDebut || !projet.dateFin) return null;

    const maintenant = new Date();
    const debut = new Date(projet.dateDebut);
    const fin = new Date(projet.dateFin);

    if (maintenant < debut) return 0;
    if (maintenant > fin) return 100;

    const dureeProjet = fin.getTime() - debut.getTime();
    const tempsEcoule = maintenant.getTime() - debut.getTime();

    return Math.round((tempsEcoule / dureeProjet) * 100);
}

module.exports = {
    formaterProjetPourGraphQL,
    formaterLivrablePourGraphQL,
    formaterProjetPourListe,
    formaterLivrablePourListe,
    calculerProgressionProjet
};