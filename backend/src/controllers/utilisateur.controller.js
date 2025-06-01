// backend/src/controllers/utilisateur.controller.js
const Utilisateur = require('../models/utilisateur.model');
const utilisateurService = require('../services/utilisateur.service');
const logger = require('../utils/logger');

/**
 * Récupérer tous les utilisateurs avec filtrage optionnel
 */
const recupererUtilisateurs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            role,
            recherche
        } = req.query;

        const filter = {};
        if (role) filter.role = role.toUpperCase();
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
const recupererUtilisateurParId = async (req, res) => {
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
 * Créer un nouvel utilisateur (CRUD)
 */
const creerUtilisateur = async (req, res) => {
    try {
        const nouvelUtilisateur = new Utilisateur({
            ...req.body,
            creeLe: new Date(),
            majLe: new Date()
        });
        await nouvelUtilisateur.save();
        logger.monitoring('Utilisateur créé', { utilisateurId: nouvelUtilisateur._id });
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
const mettreAJourUtilisateur = async (req, res) => {
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
        logger.monitoring('Utilisateur mis à jour', { utilisateurId: id });
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
const supprimerUtilisateur = async (req, res) => {
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
        logger.monitoring('Utilisateur supprimé', { utilisateurId: id });
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

/**
 * Créer un nouvel utilisateur (API simple)
 */
const createutilisateur = async (req, res) => {
    try {
        const { utilisateurId, name, email, role } = req.body;
        const newUtilisateur = new Utilisateur({ utilisateurId, name, email, role });
        await newUtilisateur.save();
        res.status(201).json(newUtilisateur);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Obtenir tous les utilisateurs (API simple)
 */
const getAllutilisateurs = async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.find();
        res.status(200).json(utilisateurs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtenir un utilisateur par son ID (API simple)
 */
const getutilisateurById = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({ message: 'utilisateur not found' });
        }
        res.status(200).json(utilisateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Mettre à jour un utilisateur par son ID (API simple)
 */
const updateutilisateur = async (req, res) => {
    try {
        const { utilisateurId, name, email, role } = req.body;
        const updatedUtilisateur = await Utilisateur.findByIdAndUpdate(
            req.params.id,
            { utilisateurId, name, email, role },
            { new: true }
        );
        if (!updatedUtilisateur) {
            return res.status(404).json({ message: 'utilisateur not found' });
        }
        res.status(200).json(updatedUtilisateur);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Supprimer un utilisateur par son ID (API simple)
 */
const deleteutilisateur = async (req, res) => {
    try {
        const deletedUtilisateur = await Utilisateur.findByIdAndDelete(req.params.id);
        if (!deletedUtilisateur) {
            return res.status(404).json({ message: 'utilisateur not found' });
        }
        res.status(200).json({ message: 'utilisateur deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Inscription d'un nouvel utilisateur
 */
const registerutilisateur = async (req, res) => {
    try {
        const { name, email, password, role, utilisateurId } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }
        const { utilisateur, token } = await utilisateurService.registerutilisateur({
            name,
            email,
            password,
            role,
            utilisateurId,
        });
        res.status(201).json({
            message: 'utilisateur registered successfully',
            utilisateur: {
                utilisateurId: utilisateur._id,
                name: utilisateur.name,
                email: utilisateur.email,
                role: utilisateur.role,
            },
            token,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Connexion d'un utilisateur
 */
const loginutilisateur = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { utilisateur, token } = await utilisateurService.loginutilisateur(email, password);
        res.status(200).json({
            message: 'Login successful',
            utilisateur: {
                utilisateurId: utilisateur._id,
                name: utilisateur.name,
                email: utilisateur.email,
                role: utilisateur.role,
            },
            token,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Vérification de l'email
 */
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const utilisateur = await Utilisateur.findOne({
            verificationToken: token,
            verificationTokenExpiration: { $gt: Date.now() },
        });
        if (!utilisateur) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        utilisateur.isVerified = true;
        utilisateur.verificationToken = undefined;
        utilisateur.verificationTokenExpiration = undefined;
        await utilisateur.save();
        res.status(200).json({ message: 'Email successfully verified' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    recupererUtilisateurs,
    recupererUtilisateurParId,
    creerUtilisateur,
    mettreAJourUtilisateur,
    supprimerUtilisateur,
    createutilisateur,
    getAllutilisateurs,
    getutilisateurById,
    updateutilisateur,
    deleteutilisateur,
    registerutilisateur,
    loginutilisateur,
    verifyEmail
};