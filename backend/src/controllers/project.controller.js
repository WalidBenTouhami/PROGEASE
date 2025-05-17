// scr/controllers/project.controller.js

const Projet = require('../models/project.model');

// Création d'un nouveau projet
exports.creerProjet = async (req, res) => {
    try {
        const projet = new Projet(req.body);
        const projetEnregistre = await projet.save();
        res.status(201).json(projetEnregistre);
    } catch (error) {
        console.error('Erreur lors de la création du projet :', error);
        res.status(500).json({ error: 'Échec de la création du projet.' });
    }
};

// Récupération de tous les projets
exports.recupererProjets = async (req, res) => {
    try {
        const projets = await Projet.find();
        res.status(200).json(projets);
    } catch (error) {
        console.error('Erreur lors de la récupération des projets :', error);
        res.status(500).json({ error: 'Échec de la récupération des projets.' });
    }
};

// Récupération d'un projet par ID
exports.recupererProjetParId = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ error: 'Projet introuvable.' });
        }
        res.status(200).json(projet);
    } catch (error) {
        console.error('Erreur lors de la récupération du projet :', error);
        res.status(500).json({ error: 'Échec de la récupération du projet.' });
    }
};

// Mise à jour d'un projet
exports.mettreAJourProjet = async (req, res) => {
    try {
        const projetMisAJour = await Projet.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!projetMisAJour) {
            return res.status(404).json({ error: 'Projet introuvable.' });
        }
        res.status(200).json(projetMisAJour);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du projet :', error);
        res.status(500).json({ error: 'Échec de la mise à jour du projet.' });
    }
};

// Suppression d'un projet
exports.supprimerProjet = async (req, res) => {
    try {
        const projetSupprime = await Projet.findByIdAndDelete(req.params.id);
        if (!projetSupprime) {
            return res.status(404).json({ error: 'Projet introuvable.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression du projet :', error);
        res.status(500).json({ error: 'Échec de la suppression du projet.' });
    }
};