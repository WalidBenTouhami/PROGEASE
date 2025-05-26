// src/controllers/livrable.controller.js

const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');

// Mapping MongoDB -> GraphQL (intituleenclature FR)
function mapperProjetMongoVersGraphQL(doc) {
    if (!doc) return null;
    return {
        _id: doc._id.toString(),
        titre: doc.titre,
        description: doc.description,
        equipe: doc.equipe.map((id) => id.toString()),
        tuteur: doc.tuteur?.toString() || null,
        competences: doc.competences,
        dateDebut: doc.dateDebut,
        dateFin: doc.dateFin,
        livrables: doc.livrables.map((id) => id.toString()),
        statut: doc.statut,
        creeLe: doc.creeLe,
        majLe: doc.majLe,
    };
}

function mapperLivrableMongoVersGraphQL(doc) {
    if (!doc) return null;
    return {
        _id: doc._id.toString(),
        intitule: doc.intitule,
        description: doc.description,
        dateEcheance: doc.dateEcheance,
        urlDepot: doc.urlDepot,
        statut: doc.statut,
        projetId: doc.projetId.toString(),
        creeLe: doc.creeLe,
        majLe: doc.majLe,
    };
}

exports.ajouterLivrable = async (req, res) => {
    try {
        const { projetId, ...donnees } = req.body;
        if (!projetId || !donnees.intitule || !donnees.description) {
            return res.status(400).json({ erreur: 'Données manquantes pour créer un livrable.' });
        }
        const projet = await Projet.findById(projetId);
        if (!projet) {
            return res.status(404).json({ erreur: 'Projet introuvable.' });
        }
        const livrable = new Livrable({ ...donnees, projetId });
        const enregistre = await livrable.save();
        projet.livrables.push(enregistre._id);
        await projet.save();
        res.status(201).json(mapperLivrableMongoVersGraphQL(enregistre));
    } catch (erreur) {
        console.error('Erreur lors de l\'ajout du livrable :', erreur);
        res.status(500).json({ erreur: 'Échec de l\'ajout du livrable.' });
    }
};

exports.recupererLivrables = async (req, res) => {
    try {
        const { projetId } = req.params;
        if (!projetId) {
            return res.status(400).json({ erreur: 'ID du projet manquant.' });
        }
        const livrables = await Livrable.find({ projetId });
        res.status(200).json(livrables.map(mapperLivrableMongoVersGraphQL));
    } catch (erreur) {
        console.error('Erreur lors de la récupération des livrables :', erreur);
        res.status(500).json({ erreur: 'Échec de la récupération des livrables.' });
    }
};

exports.mettreAJourLivrable = async (req, res) => {
    try {
        const { livrableId } = req.params;
        if (!livrableId) {
            return res.status(400).json({ erreur: 'ID du livrable manquant.' });
        }
        const maj = await Livrable.findByIdAndUpdate(livrableId, req.body, { new: true, runValidators: true });
        if (!maj) {
            return res.status(404).json({ erreur: 'Livrable introuvable.' });
        }
        res.status(200).json(mapperLivrableMongoVersGraphQL(maj));
    } catch (erreur) {
        console.error('Erreur lors de la mise à jour du livrable :', erreur);
        res.status(500).json({ erreur: 'Échec de la mise à jour du livrable.' });
    }
};

exports.supprimerLivrable = async (req, res) => {
    try {
        const { livrableId } = req.params;
        if (!livrableId) {
            return res.status(400).json({ erreur: 'ID du livrable manquant.' });
        }
        const supprime = await Livrable.findByIdAndDelete(livrableId);
        if (!supprime) {
            return res.status(404).json({ erreur: 'Livrable introuvable.' });
        }
        res.status(204).send();
    } catch (erreur) {
        console.error('Erreur lors de la suppression du livrable :', erreur);
        res.status(500).json({ erreur: 'Échec de la suppression du livrable.' });
    }
};

exports.recupererTousLivrables = async (req, res) => {
    try {
        const livrables = await Livrable.find();
        res.status(200).json(livrables.map(mapperLivrableMongoVersGraphQL));
    } catch (erreur) {
        console.error('Erreur lors de la récupération des livrables :', erreur);
        res.status(500).json({ erreur: 'Échec de la récupération des livrables.' });
    }
};

exports.recupererLivrableParId = async (req, res) => {
    try {
        const { livrableId } = req.params;
        if (!livrableId) {
            return res.status(400).json({ erreur: 'ID du livrable manquant.' });
        }
        const livrable = await Livrable.findById(livrableId);
        if (!livrable) {
            return res.status(404).json({ erreur: 'Livrable introuvable.' });
        }
        res.status(200).json(mapperLivrableMongoVersGraphQL(livrable));
    } catch (erreur) {
        console.error('Erreur lors de la récupération du livrable :', erreur);
        res.status(500).json({ erreur: 'Échec de la récupération du livrable.' });
    }
};