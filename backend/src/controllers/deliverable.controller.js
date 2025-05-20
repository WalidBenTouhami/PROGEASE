// src/controllers/deliverable.controller.js
const Projet = require('../models/project.model');
const Livrable = require('../models/deliverable.model');

// Mapping pour conversion MongoDB -> GraphQL, labels FR
function mapProjetMongoVersGraphQL(doc) {
    if (!doc) return null;
    return {
        _id: doc._id,
        titre: doc.titre,
        description: doc.description,
        equipe: doc.equipe,
        tuteur: doc.tuteur,
        competences: doc.competences,
        dateDebut: doc.dateDebut,
        dateFin: doc.dateFin,
        livrables: doc.livrables,
        statut: doc.statut,
        creeLe: doc.creeLe,
        majLe: doc.majLe,
    };
}

function mapLivrableMongoVersGraphQL(doc) {
    if (!doc) return null;
    return {
        _id: doc._id,
        nom: doc.nom,
        description: doc.description,
        dateLimite: doc.dateLimite,
        urlDepot: doc.urlDepot,
        statut: doc.statut,
        projetId: doc.projetId,
        creeLe: doc.creeLe,
        majLe: doc.majLe,
    };
}

exports.ajouterLivrable = async (req, res) => {
    try {
        const { projetId, ...data } = req.body;
        const projet = await Projet.findById(projetId);
        if (!projet) {
            return res.status(404).json({ erreur: 'Projet introuvable.' });
        }
        const livrable = new Livrable({ ...data, projetId });
        const saved = await livrable.save();
        projet.livrables.push(saved._id);
        await projet.save();
        res.status(201).json(mapLivrableMongoVersGraphQL(saved));
    } catch (error) {
        console.error('Erreur lors de l\'ajout du livrable :', error);
        res.status(500).json({ erreur: 'Échec de l\'ajout du livrable.' });
    }
};

exports.recupererLivrables = async (req, res) => {
    try {
        const { projetId } = req.params;
        const livrables = await Livrable.find({ projetId });
        res.status(200).json(livrables.map(mapLivrableMongoVersGraphQL));
    } catch (error) {
        console.error('Erreur lors de la récupération des livrables :', error);
        res.status(500).json({ erreur: 'Échec de la récupération des livrables.' });
    }
};

exports.mettreAJourLivrable = async (req, res) => {
    try {
        const { livrableId } = req.params;
        const updated = await Livrable.findByIdAndUpdate(livrableId, req.body, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({ erreur: 'Livrable introuvable.' });
        }
        res.status(200).json(mapLivrableMongoVersGraphQL(updated));
    } catch (error) {
        console.error('Erreur lors de la mise à jour du livrable :', error);
        res.status(500).json({ erreur: 'Échec de la mise à jour du livrable.' });
    }
};

exports.supprimerLivrable = async (req, res) => {
    try {
        const { livrableId } = req.params;
        const deleted = await Livrable.findByIdAndDelete(livrableId);
        if (!deleted) {
            return res.status(404).json({ erreur: 'Livrable introuvable.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression du livrable :', error);
        res.status(500).json({ erreur: 'Échec de la suppression du livrable.' });
    }
};