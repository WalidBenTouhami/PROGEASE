// src/controllers/projet.controller.js
const Projet = require('../models/projet.model');

// Fonction utilitaire pour gérer les erreurs MongoDB
const handleMongoError = (error) => {
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return { status: 400, message: errors.join(', ') };
    }
    if (error.name === 'CastError') {
        return { status: 400, message: 'ID de projet invalide.' };
    }
    console.error('Erreur MongoDB :', error);
    return { status: 500, message: 'Erreur interne du serveur.' };
};

// Création d'un nouveau projet
exports.creerProjet = async (req, res) => {
    try {
        const projet = new Projet(req.body);
        const projetEnregistre = await projet.save();
        res.status(201).json(projetEnregistre);
    } catch (error) {
        const { status, message } = handleMongoError(error);
        res.status(status).json({ erreur: message });
    }
};

// Récupération de tous les projets
exports.recupererProjets = async (req, res) => {
    try {
        const { page = 1, limit = 10, statut, tri = '-creeLe' } = req.query;
        const query = statut ? { statut } : {};

        // Utilisation de lean() pour des documents plus légers
        const [projets, total] = await Promise.all([
            Projet.find(query)
                .sort(tri)
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .populate('tuteur', 'nom prenom email')
                .populate('livrables', 'titre statut')
                .lean(),
            Projet.countDocuments(query)
        ]);




        res.status(200).json({
            projets,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        const { status, message } = handleMongoError(error);
        res.status(status).json({ erreur: message });
    }
};

// Récupération d'un projet par ID
exports.recupererProjetParId = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id)
            .populate('tuteur', 'nom prenom email')
            .populate('livrables', 'titre statut');
            
        if (!projet) {
            return res.status(404).json({ erreur: 'Projet introuvable.' });
        }
        res.status(200).json(projet);
    } catch (error) {
        const { status, message } = handleMongoError(error);
        res.status(status).json({ erreur: message });
    }
};

// Mise à jour d'un projet
exports.mettreAJourProjet = async (req, res) => {
    try {
        const projetMisAJour = await Projet.findByIdAndUpdate(
            req.params.id,
            { ...req.body, majLe: new Date() },
            { new: true, runValidators: true }
        ).populate('tuteur', 'nom prenom email')
         .populate('livrables', 'titre statut');

        if (!projetMisAJour) {
            return res.status(404).json({ erreur: 'Projet introuvable.' });
        }
        res.status(200).json(projetMisAJour);
    } catch (error) {
        const { status, message } = handleMongoError(error);
        res.status(status).json({ erreur: message });
    }
};

// Suppression d'un projet
exports.supprimerProjet = async (req, res) => {
    try {
        const projetSupprime = await Projet.findByIdAndDelete(req.params.id);
        if (!projetSupprime) {
            return res.status(404).json({ erreur: 'Projet introuvable.' });
        }
        res.status(200).json({ message: 'Projet supprimé avec succès.' });
    } catch (error) {
        const { status, message } = handleMongoError(error);
        res.status(status).json({ erreur: message });
    }
};