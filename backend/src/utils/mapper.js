/**
 * Fonctions utilitaires pour mapper les modèles entre MongoDB et GraphQL/API REST
 */

/**
 * Mappe un document Livrable MongoDB vers un format GraphQL/API
 * @param {Object} doc - Document Livrable MongoDB
 * @return {Object|null} - Document formaté ou null
 */
function mapperLivrable(doc) {
    if (!doc) return null;

    return {
        _id: doc._id.toString(),
        intitule: doc.intitule,
        description: doc.description,
        dateEcheance: doc.dateLimite instanceof Date ? doc.dateLimite.toISOString() : doc.dateLimite,
        statut: doc.statut,
        projetId: doc.projetId ? doc.projetId.toString() : null,
        creeLe: doc.creeLe instanceof Date ? doc.creeLe.toISOString() : doc.creeLe,
        majLe: doc.majLe instanceof Date ? doc.majLe.toISOString() : doc.majLe,
    };
}

/**
 * Mappe un document Projet MongoDB vers un format GraphQL/API
 * @param {Object} doc - Document Projet MongoDB
 * @return {Object|null} - Document formaté ou null
 */
function mapperProjet(doc) {
    if (!doc) return null;

    return {
        _id: doc._id.toString(),
        titre: doc.titre,
        description: doc.description,
        equipe: Array.isArray(doc.equipe) ? doc.equipe.map(id => id?.toString()) : [],
        tuteur: doc.tuteur ? doc.tuteur.toString() : null,
        competences: Array.isArray(doc.competences) ? doc.competences : [],
        dateDebut: doc.dateDebut instanceof Date ? doc.dateDebut.toISOString() : doc.dateDebut,
        dateFin: doc.dateFin instanceof Date ? doc.dateFin.toISOString() : doc.dateFin,
        livrables: Array.isArray(doc.livrables) ? doc.livrables.map(id => id?.toString()) : [],
        statut: doc.statut,
        progression: doc.progression || 0,
        creeLe: doc.creeLe instanceof Date ? doc.creeLe.toISOString() : doc.creeLe,
        majLe: doc.majLe instanceof Date ? doc.majLe.toISOString() : doc.majLe,
        duree: doc.duree
    };
}

/**
 * Mappe un document GraphQL/API vers Livrable MongoDB
 * @param {Object} input - Document API/GraphQL
 * @return {Object} - Document pour MongoDB
 */
function mapperLivrableInput(input) {
    return {
        intitule: input.intitule || input.titre,
        description: input.description,
        dateLimite: input.dateEcheance ? new Date(input.dateEcheance) : new Date(),
        projetId: input.projetId,
        statut: input.statut || 'en_attente'
    };
}

/**
 * Mappe un document GraphQL/API vers Projet MongoDB
 * @param {Object} input - Document API/GraphQL
 * @return {Object} - Document pour MongoDB
 */
function mapperProjetInput(input) {
    return {
        titre: input.titre,
        description: input.description,
        equipe: Array.isArray(input.equipe) ? input.equipe : [],
        tuteur: input.tuteur || null,
        competences: Array.isArray(input.competences) ? input.competences : [],
        dateDebut: input.dateDebut ? new Date(input.dateDebut) : new Date(),
        dateFin: input.dateFin ? new Date(input.dateFin) : null,
        statut: input.statut || 'Brouillon',
        progression: input.progression || 0
    };
}

module.exports = {
    mapperLivrable,
    mapperProjet,
    mapperLivrableInput,
    mapperProjetInput
};