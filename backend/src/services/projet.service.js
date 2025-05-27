// src/services/projet.service.js
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { formatProjetResponse } = require('../utils/formatters');
const authUtils = require('../utils/authUtils');

/**
 * Crée un nouveau projet
 * @param {Object} data - Données du projet à créer
 * @returns {Promise<Object>} - Projet créé
 */
async function creerProjet(data) {
    try {
        const projet = new Projet(data);
        const projetSauvegarde = await projet.save();
        return formatProjetResponse(projetSauvegarde);
    } catch (error) {
        logger.error(`Erreur lors de la création du projet: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Récupère tous les projets avec filtres et pagination optionnels
 * @param {Object} options - Options de filtrage et pagination
 * @param {number} options.page - Page à récupérer
 * @param {number} options.limit - Nombre d'éléments par page
 * @param {string} options.statut - Filtre par statut
 * @param {string} options.tri - Champ de tri
 * @returns {Promise<Object>} - Liste paginée de projets
 */
async function recupererTousProjets(options = {}) {
    try {
        const {
            page = 1,
            limit = 20,
            statut,
            tri = '-creeLe',
            tuteur,
            searchQuery
        } = options;

        // Construction de la requête selon les filtres
        const query = {};

        if (statut) query.statut = statut;
        if (tuteur) query.tuteur = tuteur;
        if (searchQuery) {
            query.$or = [
                { titre: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        // Exécution parallèle pour optimisation
        const [projets, total] = await Promise.all([
            Projet.find(query)
                .sort(tri)
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .populate('tuteur', 'nom prenom email')
                .lean({ virtuals: true }),
            Projet.countDocuments(query)
        ]);

        return {
            projets: projets.map(formatProjetResponse),
            pagination: {
                page: Number(page),
                limite: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        };
    } catch (error) {
        logger.error(`Erreur lors de la récupération des projets: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Récupère un projet par son ID
 * @param {string} id - ID du projet
 * @param {boolean} includeDetails - Si true, inclut les détails complets (population)
 * @returns {Promise<Object|null>} - Projet trouvé ou null
 */
async function recupererProjetParId(id, includeDetails = true) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('ID de projet invalide');
        }

        let query = Projet.findById(id);

        if (includeDetails) {
            query = query
                .populate('tuteur', 'nom prenom email')
                .populate('livrables');
        }

        const projet = await query.lean({ virtuals: true });

        return projet ? formatProjetResponse(projet) : null;
    } catch (error) {
        logger.error(`Erreur lors de la récupération du projet ${id}: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Met à jour un projet existant
 * @param {string} id - ID du projet
 * @param {Object} updateData - Données de mise à jour
 * @returns {Promise<Object|null>} - Projet mis à jour ou null
 */
async function mettreAJourProjet(id, updateData) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('ID de projet invalide');
        }

        const options = {
            new: true,           // Retourne le document mis à jour
            runValidators: true, // Applique les validateurs du schéma
        };

        const projetMisAJour = await Projet.findByIdAndUpdate(
            id,
            updateData,
            options
        ).populate('tuteur', 'nom prenom email')
            .populate('livrables');

        return projetMisAJour ? formatProjetResponse(projetMisAJour) : null;
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour du projet ${id}: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Supprime un projet par son ID
 * @param {string} id - ID du projet
 * @returns {Promise<Object|null>} - Projet supprimé ou null
 */
async function supprimerProjet(id) {
    // Utilisation d'une session pour assurer la cohérence transactionnelle
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('ID de projet invalide');
        }

        // Récupérer le projet pour la valeur de retour
        const projetASupprimer = await Projet.findById(id).session(session);

        if (!projetASupprimer) {
            await session.abortTransaction();
            session.endSession();
            return null;
        }

        // Suppression du projet
        const resultatSuppression = await Projet.findByIdAndDelete(id).session(session);

        // Suppression des livrables associés (optionnel - dépend de votre logique métier)
        await Livrable.deleteMany({ projetId: id }).session(session);

        // Finaliser la transaction
        await session.commitTransaction();
        session.endSession();

        return formatProjetResponse(resultatSuppression);
    } catch (error) {
        // Annuler la transaction en cas d'erreur
        await session.abortTransaction();
        session.endSession();

        logger.error(`Erreur lors de la suppression du projet ${id}: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Ajoute un membre à l'équipe du projet
 * @param {string} projetId - ID du projet
 * @param {string} membreId - ID du membre à ajouter
 * @returns {Promise<Object>} - Projet mis à jour
 */
async function ajouterMembreEquipe(projetId, membreId) {
    try {
        if (!mongoose.Types.ObjectId.isValid(projetId) || !mongoose.Types.ObjectId.isValid(membreId)) {
            throw new Error('ID de projet ou de membre invalide');
        }

        const projet = await Projet.findById(projetId);
        if (!projet) {
            throw new Error('Projet introuvable');
        }

        // Vérifier si le membre est déjà dans l'équipe
        if (projet.equipe.includes(membreId)) {
            return formatProjetResponse(projet);
        }

        // Ajouter le membre à l'équipe
        projet.equipe.push(membreId);
        await projet.save();

        return formatProjetResponse(projet);
    } catch (error) {
        logger.error(`Erreur lors de l'ajout du membre à l'équipe: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Retire un membre de l'équipe du projet
 * @param {string} projetId - ID du projet
 * @param {string} membreId - ID du membre à retirer
 * @returns {Promise<Object>} - Projet mis à jour
 */
async function retirerMembreEquipe(projetId, membreId) {
    try {
        if (!mongoose.Types.ObjectId.isValid(projetId) || !mongoose.Types.ObjectId.isValid(membreId)) {
            throw new Error('ID de projet ou de membre invalide');
        }

        const projet = await Projet.findById(projetId);
        if (!projet) {
            throw new Error('Projet introuvable');
        }

        // Retirer le membre de l'équipe
        projet.equipe = projet.equipe.filter(id => id.toString() !== membreId);
        await projet.save();

        return formatProjetResponse(projet);
    } catch (error) {
        logger.error(`Erreur lors du retrait du membre de l'équipe: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Analyse les risques d'un projet
 * @param {Object} params - Paramètres de l'analyse
 * @param {Object} params.projet - Objet projet (optionnel)
 * @param {string} params.descriptionProjet - Description du projet (optionnel)
 * @param {Array} params.jalons - Liste des jalons du projet
 * @param {Object} params.ressources - Ressources disponibles
 * @returns {Promise<Array>} - Liste des risques identifiés
 */
async function analyserRisques({ projet, descriptionProjet, jalons, ressources }) {
    try {
        // Validation minimale
        if (!projet && !descriptionProjet) {
            throw new Error('Le projet ou sa description est requis pour l\'analyse des risques');
        }

        // Données du projet pour l'analyse
        const donneeProjet = projet ? {
            titre: projet.titre,
            description: projet.description,
            dateDebut: projet.dateDebut,
            dateFin: projet.dateFin,
            competences: projet.competences,
            tailleEquipe: projet.equipe ? projet.equipe.length : 0
        } : { description: descriptionProjet };

        // Simulation d'analyse des risques
        // En production, vous pourriez utiliser un service IA ou un algorithme d'analyse de risques
        const risques = [
            {
                risque: 'Manque de ressources',
                gravite: 'Élevée',
                probabilite: 'Moyenne',
                impact: 'Fort',
                mitigation: 'Allouer des ressources supplémentaires ou réduire la portée du projet.',
                indicateurs: ['Retards répétés', 'Surcharge de travail signalée']
            },
            {
                risque: 'Retard dans les jalons',
                gravite: 'Moyenne',
                probabilite: 'Élevée',
                impact: 'Moyen',
                mitigation: 'Revoir les échéances et les priorités. Implémenter un suivi plus régulier.',
                indicateurs: ['Premiers jalons manqués', 'Communication irrégulière']
            },
            {
                risque: 'Défi technique',
                gravite: 'Moyenne',
                probabilite: 'Moyenne',
                impact: 'Moyen',
                mitigation: 'Planifier une formation technique pour l\'équipe ou obtenir une expertise externe.',
                indicateurs: ['Difficultés techniques signalées', 'Questions fréquentes']
            },
            {
                risque: 'Communication inefficace',
                gravite: 'Faible',
                probabilite: 'Élevée',
                impact: 'Moyen',
                mitigation: 'Établir des canaux de communication clairs et des réunions régulières.',
                indicateurs: ['Malentendus fréquents', 'Absence aux réunions']
            }
        ];

        // Ajustement de l'analyse en fonction des données spécifiques
        if (projet && projet.equipe && projet.equipe.length < 3) {
            risques.push({
                risque: 'Équipe sous-dimensionnée',
                gravite: 'Élevée',
                probabilite: 'Élevée',
                impact: 'Fort',
                mitigation: 'Ajouter des membres à l\'équipe ou ajuster la portée du projet.',
                indicateurs: ['Membres de l\'équipe surchargés', 'Retards accumulés']
            });
        }

        if (projet && projet.dateFin) {
            const maintenant = new Date();
            const dateFin = new Date(projet.dateFin);
            const joursRestants = Math.ceil((dateFin - maintenant) / (1000 * 60 * 60 * 24));

            if (joursRestants < 14) {
                risques.push({
                    risque: 'Délai de livraison serré',
                    gravite: 'Élevée',
                    probabilite: 'Élevée',
                    impact: 'Fort',
                    mitigation: 'Revoir les priorités, simplifier certains livrables ou demander une extension.',
                    indicateurs: [`Seulement ${joursRestants} jours restants`, 'Nombreuses tâches en attente']
                });
            }
        }

        return risques;
    } catch (error) {
        logger.error(`Erreur lors de l'analyse des risques: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Suit les tâches d'un projet avec filtrage optionnel
 * @param {Array} taches - Liste des tâches à suivre
 * @param {Object} filtre - Critères de filtrage
 * @returns {Promise<Object>} - Statistiques de suivi des tâches
 */
async function suiviTaches(taches, filtre = {}) {
    try {
        if (!taches || taches.length === 0) {
            throw new Error('La liste des tâches est vide. Impossible de générer un rapport.');
        }

        // Appliquer les filtres si fournis
        const tachesFiltrees = taches.filter(tache => {
            const matchesStatut = filtre.statut ? tache.statut === filtre.statut : true;
            const matchesResponsable = filtre.responsable ? tache.responsable === filtre.responsable : true;
            return matchesStatut && matchesResponsable;
        });

        // Calculs statistiques
        const total = tachesFiltrees.length;
        const termine = tachesFiltrees.filter(t => t.statut === 'Terminé' || t.statut === 'terminé').length;
        const enCours = tachesFiltrees.filter(t => t.statut === 'En cours').length;
        const aFaire = tachesFiltrees.filter(t => t.statut === 'À faire').length;
        const enRetard = tachesFiltrees.filter(t => new Date(t.dateLimite) < new Date() && t.statut !== 'Terminé').length;

        const progression = total > 0 ? Math.round((termine / total) * 100) : 0;

        // Regroupement par responsable
        const parResponsable = {};
        tachesFiltrees.forEach(tache => {
            const responsable = tache.responsable || 'Non assigné';
            if (!parResponsable[responsable]) {
                parResponsable[responsable] = {
                    total: 0,
                    termine: 0,
                    enCours: 0,
                    aFaire: 0,
                    enRetard: 0
                };
            }

            parResponsable[responsable].total += 1;

            if (tache.statut === 'Terminé' || tache.statut === 'terminé') {
                parResponsable[responsable].termine += 1;
            } else if (tache.statut === 'En cours') {
                parResponsable[responsable].enCours += 1;
            } else if (tache.statut === 'À faire') {
                parResponsable[responsable].aFaire += 1;
            }

            if (new Date(tache.dateLimite) < new Date() && tache.statut !== 'Terminé') {
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
            taches: tachesFiltrees
        };
    } catch (error) {
        logger.error(`Erreur lors du suivi des tâches: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Récupère les projets en retard qui nécessitent une attention
 * @returns {Promise<Array>} - Liste des projets en retard
 */
async function recupererProjetsEnRetard() {
    try {
        const today = new Date();
        const thresholdDate = new Date(today);
        thresholdDate.setDate(today.getDate() + 14); // Projets avec moins de 14 jours restants

        const projetsEnRetard = await Projet.find({
            statut: { $ne: 'Terminé' },
            $or: [
                { dateFin: { $lt: today } }, // Date de fin passée
                { dateFin: { $lt: thresholdDate } } // Moins de 14 jours restants
            ]
        }).populate('tuteur', 'nom prenom email')
            .sort({ dateFin: 1 }) // Les plus urgents d'abord
            .lean();

        return projetsEnRetard.map(projet => ({
            ...formatProjetResponse(projet),
            joursRestants: Math.ceil((new Date(projet.dateFin) - today) / (1000 * 60 * 60 * 24)),
            estEnRetard: new Date(projet.dateFin) < today
        }));
    } catch (error) {
        logger.error(`Erreur lors de la récupération des projets en retard: ${error.message}`, { stack: error.stack });
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
    recupererProjetsEnRetard
};
