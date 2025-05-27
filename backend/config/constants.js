/**
 * Constantes globales de l'application PROGEASE
 * SOURCE UNIQUE DE VÉRITÉ POUR LES ÉNUMÉRATIONS
 *
 * @module config/constants
 */

'use strict';

/**
 * Limites pour les requêtes et les opérations
 * @type {Object}
 */
const STATUTS_PROJET = Object.freeze({
    PROPOSE: 'PROPOSE',
    EN_COURS: 'EN_COURS',
    TERMINE: 'TERMINE',
    ARCHIVE: 'ARCHIVE',
    ANNULE: 'ANNULE'
});

const STATUTS_LIVRABLE = Object.freeze({
    EN_ATTENTE: 'EN_ATTENTE',
    EN_COURS: 'EN_COURS',
    A_VALIDER: 'A_VALIDER',
    VALIDE: 'VALIDE',
    REJETE: 'REJETE',
    EN_RETARD: 'EN_RETARD',
    TERMINE: 'TERMINE',
    PLANIFIE: 'PLANIFIE'
});

const DESCRIPTIONS_ENUM = {
    STATUTS_PROJET: {
        PROPOSE: 'Projet en phase d\'initialisation',
        EN_COURS: 'Projet en cours de réalisation',
        TERMINE: 'Projet terminé mais pas encore archivé',
        ARCHIVE: 'Projet archivé',
        ANNULE: 'Projet annulé'
    },
    STATUTS_LIVRABLE: {
        EN_ATTENTE: 'Livrable en attente de traitement',
        EN_COURS: 'Livrable en cours de réalisation',
        A_VALIDER: 'Livrable terminé en attente de validation',
        VALIDE: 'Livrable validé',
        REJETE: 'Livrable rejeté',
        EN_RETARD: 'Livrable en retard',
        TERMINE: 'Livrable terminé et validé',
        PLANIFIE: 'Livrable planifié'
    }
};

module.exports = {
    STATUTS_PROJET,
    STATUTS_LIVRABLE,
    DESCRIPTIONS_ENUM
};
const LIMITES_REQUETES = {
    TAILLE_MAX_CORPS: '50mb',
    DELAI_TIMEOUT: 120000, // 2 minutes
    MAX_PARAMETRES: 1000
};

module.exports = {
    STATUTS_PROJET,
    STATUTS_LIVRABLE,
    DESCRIPTIONS_ENUM,
    LIMITES_REQUETES,  // Exporter l'objet complet
    // autres constantes...
};