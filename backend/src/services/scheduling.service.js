// src/services/scheduling.service.js
const logger = require('../utils/logger');

/**
 * Service de planification automatisée et de rappels
 */

// Constants
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Génère des rappels automatiques pour les échéances de projet
 * @param {Object} projet - Objet projet avec dates et livrables
 * @returns {Promise<Array>} - Liste des rappels générés
 */
async function genererRappels(projet) {
    try {
        if (!projet) {
            throw new Error('Le projet est requis pour générer des rappels');
        }

        const rappels = [];
        const maintenant = new Date();

        // Rappels pour la date de fin du projet
        if (projet.dateFin) {
            const dateFin = new Date(projet.dateFin);
            const joursRestants = Math.ceil((dateFin - maintenant) / MS_PER_DAY);

            if (joursRestants > 0 && joursRestants <= 7) {
                rappels.push({
                    type: 'DEADLINE_PROJET',
                    titre: `Échéance proche: ${projet.titre}`,
                    message: `Le projet "${projet.titre}" se termine dans ${joursRestants} jour(s)`,
                    priorite: joursRestants <= 3 ? 'HAUTE' : 'MOYENNE',
                    dateRappel: new Date(dateFin.getTime() - 3 * MS_PER_DAY), // 3 jours avant
                    destinataires: projet.equipe || [],
                });
            }
        }

        // Rappels pour les livrables
        if (projet.livrables && Array.isArray(projet.livrables)) {
            for (const livrable of projet.livrables) {
                if (livrable.dateLimite && livrable.statut !== 'TERMINE') {
                    const dateLimite = new Date(livrable.dateLimite);
                    const joursRestants = Math.ceil((dateLimite - maintenant) / MS_PER_DAY);

                    if (joursRestants > 0 && joursRestants <= 5) {
                        rappels.push({
                            type: 'DEADLINE_LIVRABLE',
                            titre: `Livrable à rendre: ${livrable.intitule}`,
                            message: `Le livrable "${livrable.intitule}" doit être rendu dans ${joursRestants} jour(s)`,
                            priorite: joursRestants <= 2 ? 'URGENTE' : 'HAUTE',
                            dateRappel: new Date(dateLimite.getTime() - 2 * MS_PER_DAY), // 2 jours avant
                            destinataires: projet.equipe || [],
                            livrableId: livrable._id,
                        });
                    }
                }
            }
        }

        // Rappels pour les tâches
        if (projet.taches && Array.isArray(projet.taches)) {
            for (const tache of projet.taches) {
                if (tache.dateFin && tache.statut !== 'TERMINEE') {
                    const dateFin = new Date(tache.dateFin);
                    const joursRestants = Math.ceil((dateFin - maintenant) / MS_PER_DAY);

                    if (joursRestants > 0 && joursRestants <= 3) {
                        rappels.push({
                            type: 'DEADLINE_TACHE',
                            titre: `Tâche à terminer: ${tache.titre}`,
                            message: `La tâche "${tache.titre}" doit être terminée dans ${joursRestants} jour(s)`,
                            priorite: joursRestants <= 1 ? 'URGENTE' : 'MOYENNE',
                            dateRappel: new Date(dateFin.getTime() - 1 * MS_PER_DAY), // 1 jour avant
                            destinataires: tache.assigneA ? [tache.assigneA] : projet.equipe || [],
                            tacheId: tache._id,
                        });
                    }
                }
            }
        }

        logger.info('Rappels générés', {
            projetId: projet._id,
            nombreRappels: rappels.length,
        });

        return rappels;
    } catch (error) {
        logger.error('Erreur lors de la génération des rappels:', error);
        throw error;
    }
}

/**
 * Planifie automatiquement des réunions ou jalons
 * @param {Object} params - Paramètres de planification
 * @returns {Promise<Object>} - Planning des événements
 */
async function planifierEvenements(params) {
    try {
        const { projet, type = 'REUNION', frequence = 'HEBDOMADAIRE' } = params;

        if (!projet || !projet.dateDebut || !projet.dateFin) {
            throw new Error('Les dates du projet sont requises');
        }

        const evenements = [];
        const dateDebut = new Date(projet.dateDebut);
        const dateFin = new Date(projet.dateFin);

        let intervalleJours;
        switch (frequence) {
        case 'QUOTIDIEN':
            intervalleJours = 1;
            break;
        case 'HEBDOMADAIRE':
            intervalleJours = 7;
            break;
        case 'BIHEBDOMADAIRE':
            intervalleJours = 14;
            break;
        case 'MENSUEL':
            intervalleJours = 30;
            break;
        default:
            intervalleJours = 7;
        }

        const dateActuelle = new Date(dateDebut);
        let compteur = 1;

        while (dateActuelle <= dateFin) {
            evenements.push({
                type: type,
                titre: `${type} #${compteur} - ${projet.titre}`,
                description: `${type} planifié(e) automatiquement pour le projet "${projet.titre}"`,
                date: new Date(dateActuelle),
                duree: type === 'REUNION' ? 60 : 30, // en minutes
                participants: projet.equipe || [],
                tuteur: projet.tuteur,
                lieu: 'À définir',
                statut: 'PLANIFIE',
            });

            dateActuelle.setDate(dateActuelle.getDate() + intervalleJours);
            compteur++;
        }

        // Ajouter des événements clés
        const dureeProjet = Math.ceil((dateFin - dateDebut) / MS_PER_DAY);

        // Revue de mi-parcours
        if (dureeProjet >= 14) {
            const dateMiParcours = new Date(dateDebut.getTime() + (dateFin - dateDebut) / 2);
            evenements.push({
                type: 'REVUE',
                titre: `Revue de mi-parcours - ${projet.titre}`,
                description: 'Revue intermédiaire du projet pour évaluer l\'avancement',
                date: dateMiParcours,
                duree: 90,
                participants: projet.equipe || [],
                tuteur: projet.tuteur,
                lieu: 'À définir',
                statut: 'PLANIFIE',
                importance: 'HAUTE',
            });
        }

        // Soutenance finale
        const dateSoutenance = new Date(dateFin.getTime() - 3 * MS_PER_DAY); // 3 jours avant la fin
        evenements.push({
            type: 'SOUTENANCE',
            titre: `Soutenance finale - ${projet.titre}`,
            description: 'Présentation finale du projet',
            date: dateSoutenance,
            duree: 120,
            participants: projet.equipe || [],
            tuteur: projet.tuteur,
            lieu: 'À définir',
            statut: 'PLANIFIE',
            importance: 'CRITIQUE',
        });

        logger.info('Événements planifiés', {
            projetId: projet._id,
            nombreEvenements: evenements.length,
            frequence,
        });

        return {
            evenements: evenements.sort((a, b) => a.date - b.date),
            statistiques: {
                total: evenements.length,
                reunions: evenements.filter(e => e.type === 'REUNION').length,
                revues: evenements.filter(e => e.type === 'REVUE').length,
                soutenances: evenements.filter(e => e.type === 'SOUTENANCE').length,
            },
        };
    } catch (error) {
        logger.error('Erreur lors de la planification des événements:', error);
        throw error;
    }
}

/**
 * Génère des notifications de rappel pour les utilisateurs
 * @param {Array} rappels - Liste des rappels à notifier
 * @returns {Promise<Object>} - Résultat de l'envoi des notifications
 */
async function envoyerNotifications(rappels) {
    try {
        if (!rappels || !Array.isArray(rappels) || rappels.length === 0) {
            return {
                success: true,
                message: 'Aucun rappel à envoyer',
                envoyes: 0,
            };
        }

        const notificationsEnvoyees = [];
        const maintenant = new Date();

        for (const rappel of rappels) {
            // Vérifier si le rappel doit être envoyé maintenant
            if (rappel.dateRappel <= maintenant) {
                // Simuler l'envoi de notification
                notificationsEnvoyees.push({
                    rappelId: rappel.id || Math.random().toString(36),
                    type: rappel.type,
                    titre: rappel.titre,
                    destinataires: rappel.destinataires,
                    dateEnvoi: maintenant,
                    statut: 'ENVOYE',
                });

                logger.info('Notification envoyée', {
                    type: rappel.type,
                    destinataires: rappel.destinataires.length,
                });
            }
        }

        return {
            success: true,
            message: `${notificationsEnvoyees.length} notification(s) envoyée(s)`,
            envoyes: notificationsEnvoyees.length,
            notifications: notificationsEnvoyees,
        };
    } catch (error) {
        logger.error('Erreur lors de l\'envoi des notifications:', error);
        throw error;
    }
}

/**
 * Analyse les conflits de planning potentiels
 * @param {Array} evenements - Liste des événements à analyser
 * @returns {Array} - Liste des conflits détectés
 */
function detecterConflits(evenements) {
    try {
        const conflits = [];

        if (!evenements || evenements.length < 2) {
            return conflits;
        }

        // Trier les événements par date
        const evenementsTries = [...evenements].sort((a, b) => new Date(a.date) - new Date(b.date));

        for (let i = 0; i < evenementsTries.length - 1; i++) {
            const evt1 = evenementsTries[i];
            const evt2 = evenementsTries[i + 1];

            const fin1 = new Date(new Date(evt1.date).getTime() + evt1.duree * 60 * 1000);
            const debut2 = new Date(evt2.date);

            // Vérifier le chevauchement
            if (fin1 > debut2) {
                // Vérifier si les participants sont communs
                const participantsCommuns =
                    evt1.participants?.filter(p => evt2.participants?.includes(p)) || [];

                if (participantsCommuns.length > 0 || evt1.tuteur === evt2.tuteur) {
                    conflits.push({
                        type: 'CHEVAUCHEMENT',
                        evenement1: {
                            titre: evt1.titre,
                            date: evt1.date,
                            duree: evt1.duree,
                        },
                        evenement2: {
                            titre: evt2.titre,
                            date: evt2.date,
                            duree: evt2.duree,
                        },
                        participantsCommuns: participantsCommuns,
                        gravite: participantsCommuns.length > 2 ? 'HAUTE' : 'MOYENNE',
                    });
                }
            }
        }

        logger.info('Détection de conflits terminée', {
            nombreEvenements: evenements.length,
            nombreConflits: conflits.length,
        });

        return conflits;
    } catch (error) {
        logger.error('Erreur lors de la détection des conflits:', error);
        return [];
    }
}

module.exports = {
    genererRappels,
    planifierEvenements,
    envoyerNotifications,
    detecterConflits,
};
