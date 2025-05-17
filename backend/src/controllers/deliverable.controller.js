// src/controllers/deliverable.controller.js

const Livrable = require('../models/deliverable.model');
const Projet = require('../models/project.model');

// Ajouter un livrable
exports.ajouterLivrable = async (req, res) => {
    try {
        const { projetId, nom, description, dateLimite, urlDepot } = req.body;
        const projet = await Projet.findById(projetId);
        if (!projet) {
            return res.status(404).json({ error: 'Projet introuvable.' });
        }
        const livrable = new Livrable({
            projetId,
            nom,
            description,
            dateLimite,
            urlDepot,
        });
        const livrableEnregistre = await livrable.save();
        res.status(201).json(livrableEnregistre);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du livrable :', error.message);
        res.status(500).json({ error: 'Échec de l\'ajout du livrable.' });
    }
};

// Récupérer tous les livrables d'un projet
exports.recupererLivrables = async (req, res) => {
    try {
        const { projetId } = req.params;
        const livrables = await Livrable.find({ projetId });
        if (!livrables.length) {
            return res.status(404).json({ error: 'Aucun livrable trouvé pour ce projet.' });
        }
        res.status(200).json(livrables);
    } catch (error) {
        console.error('Erreur lors de la récupération des livrables :', error.message);
        res.status(500).json({ error: 'Échec de la récupération des livrables.' });
    }
};

// Mettre à jour un livrable
exports.mettreAJourLivrable = async (req, res) => {
    try {
        const { livrableId } = req.params;
        const livrableMisAJour = await Livrable.findByIdAndUpdate(
            livrableId,
            req.body,
            { new: true, runValidators: true }
        );
        if (!livrableMisAJour) {
            return res.status(404).json({ error: 'Livrable introuvable.' });
        }
        res.status(200).json(livrableMisAJour);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du livrable :', error.message);
        res.status(500).json({ error: 'Échec de la mise à jour du livrable.' });
    }
};

// Supprimer un livrable
exports.supprimerLivrable = async (req, res) => {
    try {
        const { livrableId } = req.params;
        const livrableSupprime = await Livrable.findByIdAndDelete(livrableId);
        if (!livrableSupprime) {
            return res.status(404).json({ error: 'Livrable introuvable.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression du livrable :', error.message);
        res.status(500).json({ error: 'Échec de la suppression du livrable.' });
    }
};