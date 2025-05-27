// src/utils/formatters.js
const logger = require('./logger');

/**
 * Formate un document MongoDB Projet pour l'API REST
 * @param {Object} projet - Document projet brut
 * @returns {Object} - Document formaté
 */
function formatProjetResponse(projet) {
    if (!projet) return null;

    try {
        // Formatage de base
        const formatte = {
            id: projet._id?.toString(),
            titre: projet.titre || '',
            description: projet.description || '',
            equipe: Array.isArray(projet.equipe)
                ? projet.equipe.map(membre => typeof membre === 'object' ? membre : membre?.toString())
                : [],
            tuteur: projet.tuteur
                ? (typeof projet.tuteur === 'object' ? projet.tuteur : projet.tuteur.toString())
                : null,
            competences: Array.isArray(projet.competences) ? projet.competences : [],
            dateDebut: projet.dateDebut,
            dateFin: projet.dateFin,
            statut: projet.statut || 'Brouillon',
            livrables: Array.isArray(projet.livrables)
                ? projet.livrables.map(livrable =>
                    typeof livrable === 'object'
                        ? formatLivrableResponse(livrable)
                        : livrable?.toString())
                : [],
            creeLe: projet.creeLe,
            majLe: projet.majLe,
            progression: projet.progression || 0
        };

        // Calcul dynamique de progression si non fourni et dates disponibles
        if (!projet.progression && projet.dateDebut && projet.dateFin) {
            const now = new Date();
            const debut = new Date(projet.dateDebut);
            const fin = new Date(projet.dateFin);

            if (now < debut) formatte.progression = 0;
            else if (now > fin) formatte.progression = 100;
            else {
                const total = fin - debut;
                const elapsed = now - debut;
                formatte.progression = Math.round((elapsed / total) * 100);
            }
        }

        return formatte;
    } catch (error) {
        logger.error(`Erreur lors du formatage du projet: ${error.message}`, { stack: error.stack });
        // Fallback minimal en cas d'erreur
        return {
            id: projet._id?.toString(),
            titre: projet.titre || 'Sans titre',
            statut: projet.statut || 'Inconnu'
        };
    }
}

/**
 * Formate un document MongoDB Livrable pour l'API REST
 * @param {Object} livrable - Document livrable brut
 * @returns {Object} - Document formaté
 */
function formatLivrableResponse(livrable) {
    if (!livrable) return null;

    try {
        // Formatage de base
        return {
            id: livrable._id?.toString(),
            nom: livrable.nom || '',
            description: livrable.description || '',
            dateLimite: livrable.dateLimite,
            urlDepot: livrable.urlDepot || '',
            statut: livrable.statut || 'En attente',
            projetId: livrable.projetId?.toString() || '',
            creeLe: livrable.creeLe,
            majLe: livrable.majLe,
            estEnRetard: estLivrableEnRetard(livrable)
        };
    } catch (error) {
        logger.error(`Erreur lors du formatage du livrable: ${error.message}`, { stack: error.stack });
        // Fallback minimal en cas d'erreur
        return {
            id: livrable._id?.toString(),
            nom: livrable.nom || 'Sans nom',
            statut: livrable.statut || 'Inconnu'
        };
    }
}

/**
 * Détermine si un livrable est en retard
 * @param {Object} livrable - Document livrable
 * @returns {boolean} - true si le livrable est en retard
 */
function estLivrableEnRetard(livrable) {
    if (!livrable || !livrable.dateLimite || livrable.statut === 'Terminé') {
        return false;
    }

    const now = new Date();
    const deadline = new Date(livrable.dateLimite);
    return now > deadline;
}

/**
 * Formate une date pour l'affichage
 * @param {Date|string} date - Date à formater
 * @param {string} format - Format souhaité (court, long)
 * @returns {string} - Date formatée
 */
function formatDate(date, format = 'court') {
    if (!date) return '';

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'Date invalide';

        if (format === 'court') {
            return dateObj.toLocaleDateString('fr-FR');
        } else if (format === 'long') {
            return dateObj.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return dateObj.toISOString();
        }
    } catch (error) {
        logger.warn(`Erreur de formatage de date: ${error.message}`);
        return String(date);
    }
}

/**
 * Formate une durée en jours en expression lisible
 * @param {number} jours - Nombre de jours
 * @returns {string} - Durée formatée
 */
function formatDureeLisible(jours) {
    if (jours === 0) return 'Aujourd\'hui';
    if (jours === 1) return 'Demain';
    if (jours === -1) return 'Hier';

    if (jours < -1) {
        return `Il y a ${Math.abs(jours)} jours`;
    } else if (jours > 1) {
        if (jours > 30) {
            const mois = Math.floor(jours / 30);
            const joursReste = jours % 30;
            if (joursReste === 0) {
                return mois === 1 ? '1 mois' : `${mois} mois`;
            } else {
                return mois === 1
                    ? `1 mois et ${joursReste} jours`
                    : `${mois} mois et ${joursReste} jours`;
            }
        } else {
            return `Dans ${jours} jours`;
        }
    }

    return `${jours} jours`;
}

module.exports = {
    formatProjetResponse,
    formatLivrableResponse,
    formatDate,
    formatDureeLisible,
    estLivrableEnRetard
};
