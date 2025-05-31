// src/controllers/livrable.controller.js
const mongoose = require('mongoose');
const Livrable = require('../models/livrable.model');
const Projet = require('../models/projet.model');
const logger = require('../utils/logger');
const { Enum } = require('../../config/constants');

/**
 * Recuperer tous les livrables
 */
exports.findAll = async (req, res) => {
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

        if (projetId && mongoose.Types.ObjectId.isValid(projetId)) {
            filter.projetId = projetId;
        }
        if (statut && Object.values(Enum.StatutLivrable).includes(statut)) {
            filter.statut = statut;
        }
        if (recherche) {
            filter.$or = [
                { intitule: { $regex: recherche, $options: 'i' } },
                { description: { $regex: recherche, $options: 'i' } }
            ];
        }
        if (dateLimiteMin) {
            filter.dateLimite = { $gte: new Date(dateLimiteMin) };
        }
        if (dateLimiteMax) {
            filter.dateLimite = { ...filter.dateLimite, $lte: new Date(dateLimiteMax) };
        }

        const livrables = await Livrable.find(filter)
            .populate('projetId', 'titre statut')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ majLe: -1 });

        const total = await Livrable.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Liste des livrables recuperee avec succes',
            data: {
                items: livrables,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            }
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
exports.findOne = async (req, res) => {
    try {
        const { livrableId } = req.params;

        const livrable = await Livrable.findById(livrableId)
            .populate('projetId', 'titre statut equipe tuteur');

        if (!livrable) {
            return res.status(404).json({
                success: false,
                message: `Livrable avec l'ID ${livrableId} non trouve`,
                error: `Livrable avec l'ID ${livrableId} non trouve`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Livrable recupere avec succes',
            data: livrable
        });
    } catch (error) {
        logger.error(`Erreur lors de la recuperation du livrable ${req.params.livrableId}:`, error);
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
exports.findByProjet = async (req, res) => {
    try {
        const { projetId } = req.params;

        const livrables = await Livrable.find({ projetId })
            .sort({ dateLimite: 1 });

        res.status(200).json({
            success: true,
            message: 'Livrables du projet recuperes avec succes',
            data: livrables
        });
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
exports.create = async (req, res) => {
    try {
        const nouveauLivrable = new Livrable({
            ...req.body,
            dateLimite: req.body.dateLimite ? new Date(req.body.dateLimite) : null,
            statut: req.body.statut || Enum.StatutLivrable.EN_ATTENTE,
            creeLe: new Date(),
            majLe: new Date()
        });

        await nouveauLivrable.save();

        // Mettre à jour le projet parent
        const projet = await Projet.findById(nouveauLivrable.projetId);
        if (projet) {
            projet.livrables.push(nouveauLivrable._id);
            await projet.save();
        }

        logger.monitoring('Livrable cree', {
            livrableId: nouveauLivrable._id,
            projetId: nouveauLivrable.projetId,
            utilisateur: req.utilisateur?.id
        });

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
exports.update = async (req, res) => {
    try {
        const { livrableId } = req.params;
        const updateData = {
            ...req.body,
            majLe: new Date()
        };

        if (updateData.dateLimite) {
            updateData.dateLimite = new Date(updateData.dateLimite);
        }

        const livrable = await Livrable.findByIdAndUpdate(
            livrableId,
            updateData,
            { new: true, runValidators: true }
        ).populate('projetId', 'titre statut');

        if (!livrable) {
            return res.status(404).json({
                success: false,
                message: `Livrable avec l'ID ${livrableId} non trouve`,
                error: `Livrable avec l'ID ${livrableId} non trouve`
            });
        }

        // Mettre à jour la progression du projet si le statut a changé
        if (req.body.statut) {
            const projet = await Projet.findById(livrable.projetId);
            if (projet) {
                await projet.calculerProgression();
                await projet.save();
            }
        }

        logger.monitoring('Livrable mis à jour', {
            livrableId,
            projetId: livrable.projetId,
            utilisateur: req.utilisateur?.id
        });

        res.status(200).json({
            success: true,
            message: 'Livrable mis à jour avec succes',
            data: livrable
        });
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour du livrable ${req.params.livrableId}:`, error);
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
exports.delete = async (req, res) => {
    try {
        const { livrableId } = req.params;

        const livrable = await Livrable.findByIdAndDelete(livrableId);

        if (!livrable) {
            return res.status(404).json({
                success: false,
                message: `Livrable avec l'ID ${livrableId} non trouve`,
                error: `Livrable avec l'ID ${livrableId} non trouve`
            });
        }

        // Mettre à jour le projet parent
        const projet = await Projet.findById(livrable.projetId);
        if (projet) {
            projet.livrables = projet.livrables.filter(id => id.toString() !== livrableId);
            await projet.calculerProgression();
            await projet.save();
        }

        logger.monitoring('Livrable supprime', {
            livrableId,
            projetId: livrable.projetId,
            utilisateur: req.utilisateur?.id
        });

        res.status(200).json({
            success: true,
            message: 'Livrable supprime avec succes',
            data: livrable
        });
    } catch (error) {
        logger.error(`Erreur lors de la suppression du livrable ${req.params.livrableId}:`, error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du livrable',
            error: error.message
        });
    }
};

module.exports = exports;