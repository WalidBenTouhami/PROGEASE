// src/routers/ai.router.js

const express = require('express');
const router = express.Router();
const {
    genererTexte,
    suiviProgression,
    predirePerformance,
    genererPlanning,
    creerEquipes,
    associerTuteurs,
    recommanderApprentissage
} = require('../services/ai.service');

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const validerChamp = (champ, req, res) => {
    if (!req.body[champ]) {
        res.status(400).json({ error: `Le champ "${champ}" est requis.` });
        return false;
    }
    return true;
};

// Générer du texte avec l'IA
router.post('/generer-texte', catchAsync(async (req, res) => {
    if (!validerChamp('prompt', req, res)) return;
    const resultat = await genererTexte(req.body.prompt);
    res.status(200).json({ resultat });
}));

// Suivi de la progression du projet
router.post('/suivi-progression', catchAsync(async (req, res) => {
    if (!validerChamp('taches', req, res)) return;
    const progression = await suiviProgression(req.body.taches);
    res.status(200).json({ progression });
}));

// Prédire la performance
router.post('/predire-performance', catchAsync(async (req, res) => {
    if (!validerChamp('historique', req, res)) return;
    const prediction = await predirePerformance(req.body.historique);
    res.status(200).json({ prediction });
}));

// Générer un planning optimisé
router.post('/generer-planning', catchAsync(async (req, res) => {
    if (!validerChamp('taches', req, res)) return;
    const planning = await genererPlanning(req.body.taches);
    res.status(200).json({ planning });
}));

// Création des équipes
router.post('/creer-equipes', catchAsync(async (req, res) => {
    if (!validerChamp('membres', req, res)) return;
    const equipes = await creerEquipes(req.body.membres);
    res.status(200).json({ equipes });
}));

// Associer mentors et mentorés
router.post('/associer-tuteurs', catchAsync(async (req, res) => {
    if (!validerChamp('membres', req, res)) return;
    const paires = await associerTuteurs(req.body.membres);
    res.status(200).json({ paires });
}));

// Recommander des ressources d'apprentissage
router.post('/recommander-apprentissage', catchAsync(async (req, res) => {
    if (!validerChamp('competences', req, res)) return;
    const ressources = await recommanderApprentissage(req.body.competences);
    res.status(200).json({ ressources });
}));

// Middleware de gestion d'erreur global
router.use((err, req, res, next) => {
    console.error('❌ Erreur attrapée par le middleware global :', err);
    res.status(500).json({ error: 'Une erreur interne est survenue. Veuillez réessayer plus tard.' });
});

module.exports = router;