// src/controllers/livrable.controller.js
const mongoose = require('mongoose');
const Livrable = require('../models/livrable.model');
const Projet = require('../models/projet.model');
const logger = require('../utils/logger');

/**
 * Recuperer tous les livrables
 */
exports.getAllLivrables = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projetId,
      statut,
      recherche,
      dateLimiteMin,
      dateLimiteMax
    } = req.query;

    const filter = {};

    if (projetId) filter.projetId = projetId;
    if (statut) filter.statut = statut;
    if (recherche) {
      filter.$or = [
        { intitule: { $regex: recherche, $options: 'i' } },
        { description: { $regex: recherche, $options: 'i' } }
      ];
    }

    // Gestion des dates limites (compatibilite avec les deux champs)
    if (dateLimiteMin) {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { dateLimite: { $gte: new Date(dateLimiteMin) } },
        { dateEcheance: { $gte: new Date(dateLimiteMin) } }
      );
    }

    if (dateLimiteMax) {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { dateLimite: { $lte: new Date(dateLimiteMax) } },
        { dateEcheance: { $lte: new Date(dateLimiteMax) } }
      );
    }

    const livrables = await Livrable.find(filter)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ majLe: -1 });

    const total = await Livrable.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Liste des livrables recuperee avec succes',
      data: livrables
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des livrables:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des livrables',
      error: error.message
    });
  }
};

/**
 * Recuperer un livrable par son ID
 */
exports.getLivrableById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de livrable invalide',
        error: 'ID de livrable invalide'
      });
    }

    const livrable = await Livrable.findById(id);

    if (!livrable) {
      return res.status(404).json({
        success: false,
        message: `Livrable avec l'ID ${id} non trouve`,
        error: `Livrable avec l'ID ${id} non trouve`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Livrable recupere avec succes',
      data: livrable
    });
  } catch (error) {
    logger.error(`Erreur lors de la recuperation du livrable ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation du livrable',
      error: error.message
    });
  }
};

/**
 * Recuperer les livrables d'un projet
 */
exports.getLivrablesByProjetId = async (req, res) => {
  try {
    const { projetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projetId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de projet invalide'
      });
    }

    const livrables = await Livrable.find({ projetId });

    res.status(200).json(livrables);
  } catch (error) {
    logger.error(`Erreur lors de la recuperation des livrables du projet ${req.params.projetId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des livrables du projet',
      error: error.message
    });
  }
};

/**
 * Creer un nouveau livrable
 */
exports.createLivrable = async (req, res) => {
  try {
    const {
      intitule,
      description,
      dateEcheance,
      dateLimite,
      urlDepot,
      statut,
      projetId
    } = req.body;

    if (!intitule || !projetId) {
      return res.status(400).json({
        success: false,
        message: 'Le titre et l\'ID du projet sont obligatoires',
        error: 'Le titre et l\'ID du projet sont obligatoires'
      });
    }

    const nouveauLivrable = new Livrable({
      intitule: intitule,
      description: description,
      dateLimite: dateLimite || null,
      urlDepot: urlDepot,
      statut: statut || 'EN_ATTENTE',
      projetId: projetId,
      creeLe: new Date(),
      majLe: new Date()
    });

    await nouveauLivrable.save();

    // Mettre à jour la date du projet
    await Projet.findByIdAndUpdate(projetId, { majLe: new Date() });
    logger.monitoring('Livrable cree', { livrableId: nouveauLivrable._id, projetId, user: req.user?.id });
    res.status(201).json({
      success: true,
      message: 'Livrable cree avec succes',
      data: nouveauLivrable
    });
  } catch (error) {
    logger.error('Erreur lors de la creation du livrable:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la creation du livrable',
      error: error.message
    });
  }
};

/**
 * Mettre à jour un livrable existant
 */
exports.updateLivrable = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      intitule,
      description,
      dateEcheance,
      dateLimite,
      urlDepot,
      statut
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de livrable invalide',
        error: 'ID de livrable invalide'
      });
    }

    const livrable = await Livrable.findById(id);

    if (!livrable) {
      return res.status(404).json({
        success: false,
        message: `Livrable avec l'ID ${id} non trouve`,
        error: `Livrable avec l'ID ${id} non trouve`
      });
    }

    const updateData = {
      ...(intitule && {
        intitule,
        titre: intitule,
        nom: intitule
      }),
      ...(description !== undefined && { description }),
      ...(dateEcheance && { dateEcheance: new Date(dateEcheance) }),
      ...(dateLimite && { dateLimite: new Date(dateLimite) }),
      ...(urlDepot !== undefined && { urlDepot }),
      ...(statut && { statut }),
      majLe: new Date()
    };

    const livableMisAJour = await Livrable.findByIdAndUpdate(id, updateData, { new: true });

    logger.monitoring('Livrable mis à jour', { livrableId: id, user: req.user?.id });
    res.status(200).json({
      success: true,
      message: 'Livrable mis à jour avec succes',
      data: livableMisAJour
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du livrable ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du livrable',
      error: error.message
    });
  }
};

/**
 * Supprimer un livrable
 */
exports.deleteLivrable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de livrable invalide',
        error: 'ID de livrable invalide'
      });
    }

    const livrable = await Livrable.findById(id);

    if (!livrable) {
      return res.status(404).json({
        success: false,
        message: `Livrable avec l'ID ${id} non trouve`,
        error: `Livrable avec l'ID ${id} non trouve`
      });
    }

    await Livrable.findByIdAndDelete(id);

    logger.monitoring('Livrable supprime', { livrableId: id, user: req.user?.id });
    res.status(200).json({
      success: true,
      message: 'Livrable supprime avec succes',
      data: {
        _id: id,
        intitule: 'Livrable supprime',
        titre: 'Livrable supprime',
        nom: 'Livrable supprime',
        statut: 'SUPPRIME'
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la suppression du livrable ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du livrable',
      error: error.message
    });
  }
};