// src/controllers/projet.controller.js
const mongoose = require('mongoose');
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const logger = require('../utils/logger');

/**
 * Récupérer tous les projets avec filtrage optionnel
 */
exports.getAllProjets = async (req, res) => {
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
    if (statut) filter.statut = statut;
    if (recherche) {
      filter.$or = [
        { titre: { $regex: recherche, $options: 'i' } },
        { description: { $regex: recherche, $options: 'i' } }
      ];
    }
    if (dateDebutMin) filter.dateDebut = { $gte: new Date(dateDebutMin) };
    if (dateFinMax) filter.dateFin = { $lte: new Date(dateFinMax) };
    if (tuteurId) filter.tuteur = tuteurId;
    if (membreEquipe) filter.equipe = { $in: [membreEquipe] };
    if (competence) filter.competences = { $in: [competence] };

    const projets = await Projet.find(filter)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ majLe: -1 });

    const total = await Projet.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Liste des projets récupérée avec succès',
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
    logger.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
};

/**
 * Récupérer un projet par son ID
 */
exports.getProjetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de projet invalide',
        error: 'ID de projet invalide'
      });
    }

    const projet = await Projet.findById(id);

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: `Projet avec l'ID ${id} non trouvé`,
        error: `Projet avec l'ID ${id} non trouvé`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Projet récupéré avec succès',
      data: projet
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du projet ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du projet',
      error: error.message
    });
  }
};

/**
 * Créer un nouveau projet
 */
exports.createProjet = async (req, res) => {
  try {
    const {
      titre,
      description,
      equipe,
      tuteur,
      competences,
      dateDebut,
      dateFin,
      statut = 'PROPOSE'
    } = req.body;

    // Validation des données d'entrée
    if (!titre) {
      return res.status(400).json({
        success: false,
        message: 'Le titre du projet est obligatoire',
        error: 'Le titre du projet est obligatoire'
      });
    }

    const nouveauProjet = new Projet({
      titre,
      description,
      equipe: equipe || [],
      tuteur,
      competences: competences || [],
      dateDebut: dateDebut ? new Date(dateDebut) : new Date(),
      dateFin: dateFin ? new Date(dateFin) : null,
      statut,
      progression: 0,
      creeLe: new Date(),
      majLe: new Date(),
      createur: req.user ? req.user.id : undefined
    });

    await nouveauProjet.save();
    logger.monitoring('Projet créé', { projetId: nouveauProjet._id, user: req.user?.id });
    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      data: nouveauProjet
    });
  } catch (error) {
    logger.error('Erreur lors de la création du projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet',
      error: error.message
    });
  }
};

/**
 * Mettre à jour un projet existant
 */
exports.updateProjet = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titre,
      description,
      equipe,
      tuteur,
      competences,
      dateDebut,
      dateFin,
      statut
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de projet invalide',
        error: 'ID de projet invalide'
      });
    }

    const projet = await Projet.findById(id);

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: `Projet avec l'ID ${id} non trouvé`,
        error: `Projet avec l'ID ${id} non trouvé`
      });
    }

    const projetMisAJour = await Projet.findByIdAndUpdate(
      id,
      {
        ...(titre && { titre }),
        ...(description !== undefined && { description }),
        ...(equipe && { equipe }),
        ...(tuteur !== undefined && { tuteur }),
        ...(competences && { competences }),
        ...(dateDebut && { dateDebut: new Date(dateDebut) }),
        ...(dateFin && { dateFin: new Date(dateFin) }),
        ...(statut && { statut }),
        majLe: new Date(),
        ...(req.user && { majPar: req.user.id })
      },
      { new: true }
    );

    logger.monitoring('Projet mis à jour', { projetId: id, user: req.user?.id });
    res.status(200).json({
      success: true,
      message: 'Projet mis à jour avec succès',
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
exports.deleteProjet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de projet invalide',
        error: 'ID de projet invalide'
      });
    }

    const projet = await Projet.findById(id);

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: `Projet avec l'ID ${id} non trouvé`,
        error: `Projet avec l'ID ${id} non trouvé`
      });
    }

    // Supprimer tous les livrables associés
    await Livrable.deleteMany({ projetId: id });

    // Supprimer le projet
    await Projet.findByIdAndDelete(id);

    logger.monitoring('Projet supprimé', { projetId: id, user: req.user?.id });
    res.status(200).json({
      success: true,
      message: 'Projet supprimé avec succès',
      data: {
        _id: id,
        titre: 'Projet supprimé',
        statut: 'SUPPRIME'
      }
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