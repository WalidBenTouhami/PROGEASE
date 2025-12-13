// src/services/projet.service.js
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { formatProjetResponse } = require('../utils/formatters');

/**
 * Cree un nouveau projet
 * @param {Object} data - Donnees du projet à creer
 * @returns {Promise<Object>} - Projet cree
 */
async function creerProjet(data) {
    try {
        const projet = new Projet(data);
        const projetSauvegarde = await projet.save();
        return formatProjetResponse(projetSauvegarde);
    } catch (error) {
        logger.error(`Erreur lors de la creation du projet: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Recupere tous les projets avec filtres et pagination optionnels
 * @param {Object} options - Options de filtrage et pagination
 * @param {number} options.page - Page à recuperer
 * @param {number} options.limit - Nombre d'elements par page
 * @param {string} options.statut - Filtre par statut
 * @param {string} options.tri - Champ de tri
 * @returns {Promise<Object>} - Liste paginee de projets
 */
async function recupererTousProjets(options = {}) {
    try {
        const { page = 1, limit = 20, statut, tri = '-creeLe', tuteur, searchQuery } = options;

        // Construction de la requete selon les filtres
        const query = {};

        if (statut) query.statut = statut;
        if (tuteur) query.tuteur = tuteur;
        if (searchQuery) {
            query.$or = [
                { titre: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
            ];
        }

        // Execution parallele pour optimisation
        const [projets, total] = await Promise.all([
            Projet.find(query)
                .sort(tri)
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .populate('tuteur', 'nom prenom email')
                .lean({ virtuals: true }),
            Projet.countDocuments(query),
        ]);

        return {
            projets: projets.map(formatProjetResponse),
            pagination: {
                page: Number(page),
                limite: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        };
    } catch (error) {
        logger.error(`Erreur lors de la recuperation des projets: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Recupere un projet par son ID
 * @param {string} id - ID du projet
 * @param {boolean} includeDetails - Si true, inclut les details complets (population)
 * @returns {Promise<Object|null>} - Projet trouve ou null
 */
async function recupererProjetParId(id, includeDetails = true) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('ID de projet invalide');
        }

        let query = Projet.findById(id);

        if (includeDetails) {
            query = query.populate('tuteur', 'nom prenom email').populate('livrables');
        }

        const projet = await query.lean({ virtuals: true });

        return projet ? formatProjetResponse(projet) : null;
    } catch (error) {
        logger.error(`Erreur lors de la recuperation du projet ${id}: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Met à jour un projet existant
 * @param {string} id - ID du projet
 * @param {Object} updateData - Donnees de mise à jour
 * @returns {Promise<Object|null>} - Projet mis à jour ou null
 */
async function mettreAJourProjet(id, { nom, description, dateDebut, dateFin, statut, priorite }) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('ID de projet invalide');
        }

        const options = {
            new: true, // Retourne le document mis à jour
            runValidators: true, // Applique les validateurs du schema
        };

        const projetMisAJour = await Projet.findByIdAndUpdate(
            id,
            { nom, description, dateDebut, dateFin, statut, priorite },
            options
        )
            .populate('tuteur', 'nom prenom email')
            .populate('livrables');

        return projetMisAJour ? formatProjetResponse(projetMisAJour) : null;
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour du projet ${id}: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Supprime un projet par son ID
 * @param {string} id - ID du projet
 * @returns {Promise<Object|null>} - Projet supprime ou null
 */
async function supprimerProjet(id) {
    // Utilisation d'une session pour assurer la coherence transactionnelle
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('ID de projet invalide');
        }

        // Recuperer le projet pour la valeur de retour
        const projetASupprimer = await Projet.findById(id).session(session);

        if (!projetASupprimer) {
            await session.abortTransaction();
            session.endSession();
            return null;
        }

        // Suppression du projet
        const resultatSuppression = await Projet.findByIdAndDelete(id).session(session);

        // Suppression des livrables associes (optionnel - depend de votre logique metier)
        await Livrable.deleteMany({ projetId: id }).session(session);

        // Finaliser la transaction
        await session.commitTransaction();
        session.endSession();

        return formatProjetResponse(resultatSuppression);
    } catch (error) {
        // Annuler la transaction en cas d'erreur
        await session.abortTransaction();
        session.endSession();

        logger.error(`Erreur lors de la suppression du projet ${id}: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Ajoute un membre à l'equipe du projet
 * @param {string} projetId - ID du projet
 * @param {string} membreId - ID du membre à ajouter
 * @returns {Promise<Object>} - Projet mis à jour
 */
async function ajouterMembreEquipe(projetId, membreId) {
    try {
        if (
            !mongoose.Types.ObjectId.isValid(projetId) ||
            !mongoose.Types.ObjectId.isValid(membreId)
        ) {
            throw new Error('ID de projet ou de membre invalide');
        }

        const projet = await Projet.findById(projetId);
        if (!projet) {
            throw new Error('Projet introuvable');
        }

        // Verifier si le membre est dejà dans l'equipe
        if (projet.equipe.includes(membreId)) {
            return formatProjetResponse(projet);
        }

        // Ajouter le membre à l'equipe
        projet.equipe.push(membreId);
        await projet.save();

        return formatProjetResponse(projet);
    } catch (error) {
        logger.error(`Erreur lors de l'ajout du membre à l'equipe: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Retire un membre de l'equipe du projet
 * @param {string} projetId - ID du projet
 * @param {string} membreId - ID du membre à retirer
 * @returns {Promise<Object>} - Projet mis à jour
 */
async function retirerMembreEquipe(projetId, membreId) {
    try {
        if (
            !mongoose.Types.ObjectId.isValid(projetId) ||
            !mongoose.Types.ObjectId.isValid(membreId)
        ) {
            throw new Error('ID de projet ou de membre invalide');
        }

        const projet = await Projet.findById(projetId);
        if (!projet) {
            throw new Error('Projet introuvable');
        }

        // Retirer le membre de l'equipe
        projet.equipe = projet.equipe.filter(id => id.toString() !== membreId);
        await projet.save();

        return formatProjetResponse(projet);
    } catch (error) {
        logger.error(`Erreur lors du retrait du membre de l'equipe: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Analyse les risques d'un projet
 * @param {Object} params - Parametres de l'analyse
 * @param {Object} params.projet - Objet projet (optionnel)
 * @param {string} params.descriptionProjet - Description du projet (optionnel)
 * @returns {Promise<Array>} - Liste des risques identifies
 */
async function analyserRisques({ projet, descriptionProjet }) {
    try {
        // Validation minimale
        if (!projet && !descriptionProjet) {
            throw new Error('Le projet ou sa description est requis pour l\'analyse des risques');
        }

        // Donnees du projet pour l'analyse
        const donneeProjet = projet
            ? {
                titre: projet.titre,
                description: projet.description,
                dateDebut: projet.dateDebut,
                dateFin: projet.dateFin,
                competences: projet.competences,
                tailleEquipe: projet.equipe ? projet.equipe.length : 0,
            }
            : { description: descriptionProjet };

        // Simulation d'analyse des risques basée sur les données du projet
        const risques = [
            {
                risque: 'Manque de ressources',
                gravite: donneeProjet.tailleEquipe < 3 ? 'elevee' : 'Moyenne',
                probabilite: 'Moyenne',
                impact: 'Fort',
                mitigation:
                    'Allouer des ressources supplementaires ou reduire la portee du projet.',
                indicateurs: ['Retards repetes', 'Surcharge de travail signalee'],
            },
            {
                risque: 'Retard dans les jalons',
                gravite: 'Moyenne',
                probabilite: 'elevee',
                impact: 'Moyen',
                mitigation:
                    'Revoir les echeances et les priorites. Implementer un suivi plus regulier.',
                indicateurs: ['Premiers jalons manques', 'Communication irreguliere'],
            },
            {
                risque: 'Defi technique',
                gravite: 'Moyenne',
                probabilite: 'Moyenne',
                impact: 'Moyen',
                mitigation:
                    'Planifier une formation technique pour l\'equipe ou obtenir une expertise externe.',
                indicateurs: ['Difficultes techniques signalees', 'Questions frequentes'],
            },
            {
                risque: 'Communication inefficace',
                gravite: 'Faible',
                probabilite: 'elevee',
                impact: 'Moyen',
                mitigation:
                    'etablir des canaux de communication clairs et des reunions regulieres.',
                indicateurs: ['Malentendus frequents', 'Absence aux reunions'],
            },
        ];

        // Ajustement de l'analyse en fonction des donnees specifiques
        if (projet && projet.equipe && projet.equipe.length < 3) {
            risques.push({
                risque: 'equipe sous-dimensionnee',
                gravite: 'elevee',
                probabilite: 'elevee',
                impact: 'Fort',
                mitigation: 'Ajouter des membres à l\'equipe ou ajuster la portee du projet.',
                indicateurs: ['Membres de l\'equipe surcharges', 'Retards accumules'],
            });
        }

        if (projet && projet.dateFin) {
            const maintenant = new Date();
            const dateFin = new Date(projet.dateFin);
            const joursRestants = Math.ceil((dateFin - maintenant) / (1000 * 60 * 60 * 24));

            if (joursRestants < 14) {
                risques.push({
                    risque: 'Delai de livraison serre',
                    gravite: 'elevee',
                    probabilite: 'elevee',
                    impact: 'Fort',
                    mitigation:
                        'Revoir les priorites, simplifier certains livrables ou demander une extension.',
                    indicateurs: [
                        `Seulement ${joursRestants} jours restants`,
                        'Nombreuses tâches en attente',
                    ],
                });
            }
        }

        return risques;
    } catch (error) {
        logger.error(`Erreur lors de l'analyse des risques: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Suit les tâches d'un projet avec filtrage optionnel
 * @param {Array} taches - Liste des tâches à suivre
 * @param {Object} filtre - Criteres de filtrage
 * @returns {Promise<Object>} - Statistiques de suivi des tâches
 */
async function suiviTaches(taches, filtre = {}) {
    try {
        if (!taches || taches.length === 0) {
            throw new Error('La liste des tâches est vide. Impossible de generer un rapport.');
        }

        // Appliquer les filtres si fournis
        const tachesFiltrees = taches.filter(tache => {
            const matchesStatut = filtre.statut ? tache.statut === filtre.statut : true;
            const matchesResponsable = filtre.responsable
                ? tache.responsable === filtre.responsable
                : true;
            return matchesStatut && matchesResponsable;
        });

        // Calculs statistiques
        const total = tachesFiltrees.length;
        const termine = tachesFiltrees.filter(
            t => t.statut === 'Termine' || t.statut === 'termine'
        ).length;
        const enCours = tachesFiltrees.filter(t => t.statut === 'En cours').length;
        const aFaire = tachesFiltrees.filter(t => t.statut === 'À faire').length;
        const enRetard = tachesFiltrees.filter(
            t => new Date(t.dateLimite) < new Date() && t.statut !== 'Termine'
        ).length;

        const progression = total > 0 ? Math.round((termine / total) * 100) : 0;

        // Regroupement par responsable
        const parResponsable = {};
        tachesFiltrees.forEach(tache => {
            const responsable = tache.responsable || 'Non assigne';
            if (!parResponsable[responsable]) {
                parResponsable[responsable] = {
                    total: 0,
                    termine: 0,
                    enCours: 0,
                    aFaire: 0,
                    enRetard: 0,
                };
            }

            parResponsable[responsable].total += 1;

            if (tache.statut === 'Termine' || tache.statut === 'termine') {
                parResponsable[responsable].termine += 1;
            } else if (tache.statut === 'En cours') {
                parResponsable[responsable].enCours += 1;
            } else if (tache.statut === 'À faire') {
                parResponsable[responsable].aFaire += 1;
            }

            if (new Date(tache.dateLimite) < new Date() && tache.statut !== 'Termine') {
                parResponsable[responsable].enRetard += 1;
            }
        });

        return {
            total,
            termine,
            enCours,
            aFaire,
            enRetard,
            progression,
            parResponsable,
            taches: tachesFiltrees,
        };
    } catch (error) {
        logger.error(`Erreur lors du suivi des tâches: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Recupere les projets en retard qui necessitent une attention
 * @returns {Promise<Array>} - Liste des projets en retard
 */
async function recupererProjetsEnRetard() {
    try {
        const today = new Date();
        const thresholdDate = new Date(today);
        thresholdDate.setDate(today.getDate() + 14); // Projets avec moins de 14 jours restants

        const projetsEnRetard = await Projet.find({
            statut: { $ne: 'Termine' },
            $or: [
                { dateFin: { $lt: today } }, // Date de fin passee
                { dateFin: { $lt: thresholdDate } }, // Moins de 14 jours restants
            ],
        })
            .populate('tuteur', 'nom prenom email')
            .sort({ dateFin: 1 }) // Les plus urgents d'abord
            .lean();

        return projetsEnRetard.map(projet => ({
            ...formatProjetResponse(projet),
            joursRestants: Math.ceil((new Date(projet.dateFin) - today) / (1000 * 60 * 60 * 24)),
            estEnRetard: new Date(projet.dateFin) < today,
        }));
    } catch (error) {
        logger.error(`Erreur lors de la recuperation des projets en retard: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

module.exports = {
    creerProjet,
    recupererTousProjets,
    recupererProjetParId,
    mettreAJourProjet,
    supprimerProjet,
    ajouterMembreEquipe,
    retirerMembreEquipe,
    analyserRisques,
    suiviTaches,
    recupererProjetsEnRetard,
};
