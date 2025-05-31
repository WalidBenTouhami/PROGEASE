const Utilisateur = require('../models/utilisateur.model');
const logger = require('../utils/logger');

/**
 * Récupérer tous les utilisateurs avec filtrage optionnel
 */
exports.recupererUtilisateurs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            role,
            recherche
        } = req.query;

        const filter = {};

        // Application des filtres
        if (role) {
            filter.role = role.toUpperCase();
        }
        if (recherche) {
            filter.$or = [
                { nom: { $regex: recherche, $options: 'i' } },
                { email: { $regex: recherche, $options: 'i' } }
            ];
        }

        const utilisateurs = await Utilisateur.find(filter)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ majLe: -1 })
            .populate('projets', 'titre statut');

        const total = await Utilisateur.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Liste des utilisateurs récupérée avec succès',
            data: {
                items: utilisateurs,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs',
            error: error.message
        });
    }
};

/**
 * Récupérer un utilisateur par son ID
 */
exports.recupererUtilisateurParId = async (req, res) => {
    try {
        const { id } = req.params;

        const utilisateur = await Utilisateur.findById(id)
            .populate('projets', 'titre statut');

        if (!utilisateur) {
            return res.status(404).json({
                success: false,
                message: `Utilisateur avec l'ID ${id} non trouvé`,
                error: `Utilisateur avec l'ID ${id} non trouvé`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Utilisateur récupéré avec succès',
            data: utilisateur
        });
    } catch (error) {
        logger.error(`Erreur lors de la récupération de l'utilisateur ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'utilisateur',
            error: error.message
        });
    }
};

/**
 * Créer un nouvel utilisateur
 */
exports.creerUtilisateur = async (req, res) => {
    try {
        const nouvelUtilisateur = new Utilisateur({
            ...req.body,
            creeLe: new Date(),
            majLe: new Date()
        });

        await nouvelUtilisateur.save();

        logger.monitoring('Utilisateur créé', { userId: nouvelUtilisateur._id });

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: nouvelUtilisateur
        });
    } catch (error) {
        logger.error('Erreur lors de la création de l\'utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'utilisateur',
            error: error.message
        });
    }
};

/**
 * Mettre à jour un utilisateur existant
 */
exports.mettreAJourUtilisateur = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            majLe: new Date()
        };

        const utilisateurMisAJour = await Utilisateur.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('projets', 'titre statut');

        if (!utilisateurMisAJour) {
            return res.status(404).json({
                success: false,
                message: `Utilisateur avec l'ID ${id} non trouvé`,
                error: `Utilisateur avec l'ID ${id} non trouvé`
            });
        }

        logger.monitoring('Utilisateur mis à jour', { userId: id });

        res.status(200).json({
            success: true,
            message: 'Utilisateur mis à jour avec succès',
            data: utilisateurMisAJour
        });
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour de l'utilisateur ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'utilisateur',
            error: error.message
        });
    }
};

/**
 * Supprimer un utilisateur
 */
exports.supprimerUtilisateur = async (req, res) => {
    try {
        const { id } = req.params;

        const utilisateurSupprime = await Utilisateur.findByIdAndDelete(id);

        if (!utilisateurSupprime) {
            return res.status(404).json({
                success: false,
                message: `Utilisateur avec l'ID ${id} non trouvé`,
                error: `Utilisateur avec l'ID ${id} non trouvé`
            });
        }

        logger.monitoring('Utilisateur supprimé', { userId: id });

        res.status(200).json({
            success: true,
            message: 'Utilisateur supprimé avec succès',
            data: utilisateurSupprime
        });
    } catch (error) {
        logger.error(`Erreur lors de la suppression de l'utilisateur ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'utilisateur',
            error: error.message
        });
    }
};

module.exports = exports;