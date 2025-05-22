const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projet.controller');
const { analyserRisques, suiviTaches } = require('../services/projet.service');

// Création d'un projet
router.post('/', projectController.creerProjet);

// Récupération de tous les projets
router.get('/', projectController.recupererProjets);

// Récupération d'un projet par ID
router.get('/:id', projectController.recupererProjetParId);

// Mise à jour d'un projet
router.put('/:id', projectController.mettreAJourProjet);

// Suppression d'un projet
router.delete('/:id', projectController.supprimerProjet);

// Analyse de risques
router.post('/analyse-risques', async (req, res) => {
    try {
        const { descriptionProjet, jalons, ressources } = req.body;
        const risques = await analyserRisques({ descriptionProjet, jalons, ressources });
        res.status(200).json(risques);
    } catch (error) {
        console.error('Erreur lors de l\'analyse des risques :', error.message);
        res.status(500).json({ error: 'Échec de l\'analyse des risques.' });
    }
});

// Suivi des tâches et progression
router.post('/suivi-taches', async (req, res) => {
    try {
        const { taches, filtre } = req.body;
        const rapportTaches = await suiviTaches(taches, filtre);
        res.status(200).json(rapportTaches);
    } catch (error) {
        console.error('Erreur lors du suivi des tâches :', error.message);
        res.status(500).json({ error: 'Échec du suivi des tâches.' });
    }
});

module.exports = router;