// src/controllers/projet.controller.js
const mongoose = require('mongoose');
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const logger = require('../utils/logger');
const { Enum } = require('../../config/constants');

/**
 * Recuperer tous les projets avec filtrage optionnel
 */
exports.recupererProjets = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            statut,
            recherche,
            dateDebutMin,
            dateFinMax,
            tuteurId,
            membreEquipe,
            competence
        } = req.query;

        const filter = {};

        // Application des filtres
        if (statut && Object.values(Enum.StatutProjet).includes(statut)) {
            filter.statut = statut;
        }
        if (recherche) {
            filter.$or = [
                { titre: { $regex: recherche, $options: 'i' } },
                { description: { $regex: recherche, $options: 'i' } }
            ];
        }
        if (dateDebutMin) filter.dateDebut = { $gte: new Date(dateDebutMin) };
        if (dateFinMax) filter.dateFin = { $lte: new Date(dateFinMax) };
        if (tuteurId && mongoose.Types.ObjectId.isValid(tuteurId)) filter.tuteur = tuteurId;
        if (membreEquipe && mongoose.Types.ObjectId.isValid(membreEquipe)) filter.equipe = membreEquipe;
        if (competence) filter.competences = competence;

        const projets = await Projet.find(filter)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ majLe: -1 });

        const total = await Projet.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Liste des projets recuperee avec succes',
            data: {
                items: projets,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasNextPage: parseInt(page) < Math.ceil(total / limit),
                    hasPreviousPage: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la recuperation des projets:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation des projets',
            error: error.message
        });
    }
};

/**
 * Recuperer un projet par son ID
 */
exports.recupererProjetParId = async (req, res) => {
    try {
        const { id } = req.params;

        const projet = await Projet.findById(id)
            .populate('livrablesComplets');

        if (!projet) {
            return res.status(404).json({
                success: false,
                message: `Projet avec l'ID ${id} non trouve`,
                error: `Projet avec l'ID ${id} non trouve`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Projet recupere avec succes',
            data: projet
        });
    } catch (error) {
        logger.error(`Erreur lors de la recuperation du projet ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation du projet',
            error: error.message
        });
    }
};

/**
 * Creer un nouveau projet
 */
exports.creerProjet = async (req, res) => {
    try {
        const nouveauProjet = new Projet({
            ...req.body,
            dateDebut: req.body.dateDebut ? new Date(req.body.dateDebut) : new Date(),
            dateFin: req.body.dateFin ? new Date(req.body.dateFin) : null,
            statut: req.body.statut || Enum.StatutProjet.BROUILLON,
            progression: 0,
            creeLe: new Date(),
            majLe: new Date(),
            createur: req.utilisateur ? req.utilisateur.id : undefined
        });

        await nouveauProjet.save();

        logger.monitoring('Projet cree', { projetId: nouveauProjet._id, utilisateur: req.utilisateur?.id });

        res.status(201).json({
            success: true,
            message: 'Projet cree avec succes',
            data: nouveauProjet
        });
    } catch (error) {
        logger.error('Erreur lors de la creation du projet:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la creation du projet',
            error: error.message
        });
    }
};

/**
 * Mettre à jour un projet existant
 */
exports.mettreAJourProjet = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            majLe: new Date()
        };

        // Conversion des dates si présentes
        if (updateData.dateDebut) updateData.dateDebut = new Date(updateData.dateDebut);
        if (updateData.dateFin) updateData.dateFin = new Date(updateData.dateFin);

        const projetMisAJour = await Projet.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('tuteur', 'nom prenom email')
            .populate('equipe', 'nom prenom email')
            .populate('livrablesComplets');

        if (!projetMisAJour) {
            return res.status(404).json({
                success: false,
                message: `Projet avec l'ID ${id} non trouve`,
                error: `Projet avec l'ID ${id} non trouve`
            });
        }

        // Recalculer la progression si nécessaire
        if (req.body.livrables || req.body.statut) {
            await projetMisAJour.calculerProgression();
            await projetMisAJour.save();
        }

        logger.monitoring('Projet mis à jour', { projetId: id, utilisateur: req.utilisateur?.id });

        res.status(200).json({
            success: true,
            message: 'Projet mis à jour avec succes',
            data: projetMisAJour
        });
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour du projet ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du projet',
            error: error.message
        });
    }
};

/**
 * Supprimer un projet
 */
exports.supprimerProjet = async (req, res) => {
    try {
        const { id } = req.params;

        // Supprimer d'abord les livrables associés
        await Livrable.deleteMany({ projetId: id });

        const projetSupprime = await Projet.findByIdAndDelete(id);

        if (!projetSupprime) {
            return res.status(404).json({
                success: false,
                message: `Projet avec l'ID ${id} non trouve`,
                error: `Projet avec l'ID ${id} non trouve`
            });
        }

        logger.monitoring('Projet supprime', { projetId: id, utilisateur: req.utilisateur?.id });

        res.status(200).json({
            success: true,
            message: 'Projet et ses livrables supprimes avec succes',
            data: projetSupprime
        });
    } catch (error) {
        logger.error(`Erreur lors de la suppression du projet ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du projet',
            error: error.message
        });
    }
};

/**
 * Analyser les risques d'un projet
 */
exports.analyserRisques = async (req, res) => {
    try {
        const { projetId } = req.body;

        const projet = await Projet.findById(projetId)
            .populate('livrablesComplets')
            .populate('equipe', 'nom prenom email');

        if (!projet) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouve',
                error: 'Projet non trouve'
            });
        }

        // Analyse des risques basée sur plusieurs facteurs
        const risques = {
            retard: projet.estEnRetard,
            progression: projet.progression < 50 && projet.dateFin < new Date(),
            livrables: projet.livrablesComplets.some(l => l.estEnRetard()),
            equipe: projet.equipe.length < 2
        };

        const niveauRisque = Object.values(risques).filter(Boolean).length;

        res.status(200).json({
            success: true,
            message: 'Analyse des risques effectuee avec succes',
            data: {
                risques,
                niveauRisque,
                recommandations: genererRecommandations(risques)
            }
        });
    } catch (error) {
        logger.error('Erreur lors de l\'analyse des risques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'analyse des risques',
            error: error.message
        });
    }
};

/**
 * Générer des recommandations basées sur les risques
 */
function genererRecommandations(risques) {
    const recommandations = [];

    if (risques.retard) {
        recommandations.push('Revoir le planning du projet et ajuster les échéances');
    }
    if (risques.progression) {
        recommandations.push('Augmenter les ressources allouées au projet');
    }
    if (risques.livrables) {
        recommandations.push('Organiser une réunion de suivi des livrables en retard');
    }
    if (risques.equipe) {
        recommandations.push('Renforcer l\'équipe projet');
    }

    return recommandations;
}

module.exports = exports;