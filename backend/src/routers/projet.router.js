const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projet.controller');
const { analyserRisques, suiviTaches } = require('../services/projet.service');

// Middleware de validation
const validateProjetId = (req, res, next) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ erreur: 'ID de projet invalide.' });
    }
    next();
};

// Middleware de validation du corps de la requête
const validateProjetBody = (req, res, next) => {
    const { titre, description, dateDebut, dateFin } = req.body;
    
    if (!titre || !description || !dateDebut || !dateFin) {
        return res.status(400).json({
            erreur: 'Les champs titre, description, dateDebut et dateFin sont requis.'
        });
    }

    // Validation des dates
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
        return res.status(400).json({
            erreur: 'Les dates de début et de fin doivent être valides.'
        });
    }

    if (fin <= debut) {
        return res.status(400).json({
            erreur: 'La date de fin doit être postérieure à la date de début.'
        });
    }

    next();
};

// Routes
router.post('/', validateProjetBody, projectController.creerProjet);
router.get('/', projectController.recupererProjets);
router.get('/:id', validateProjetId, projectController.recupererProjetParId);
router.put('/:id', [validateProjetId, validateProjetBody], projectController.mettreAJourProjet);
router.delete('/:id', validateProjetId, projectController.supprimerProjet);

// Analyse de risques
router.post('/analyse-risques', async (req, res) => {
    try {
        const { descriptionProjet, jalons, ressources } = req.body;
        
        if (!descriptionProjet || !jalons || !ressources) {
            return res.status(400).json({
                erreur: 'Description du projet, jalons et ressources sont requis.'
            });
        }

        const risques = await analyserRisques({ descriptionProjet, jalons, ressources });
        res.status(200).json(risques);
    } catch (error) {
        console.error('Erreur lors de l\'analyse des risques :', error.message);
        res.status(500).json({ 
            erreur: 'Échec de l\'analyse des risques.',
            details: error.message
        });
    }
});

// Suivi des tâches et progression
router.post('/suivi-taches', async (req, res) => {
    try {
        const { taches, filtre } = req.body;
        
        if (!Array.isArray(taches) || taches.length === 0) {
            return res.status(400).json({
                erreur: 'Un tableau de tâches non vide est requis.'
            });
        }

        const rapportTaches = await suiviTaches(taches, filtre);
        res.status(200).json(rapportTaches);
    } catch (error) {
        console.error('Erreur lors du suivi des tâches :', error.message);
        res.status(500).json({ 
            erreur: 'Échec du suivi des tâches.',
            details: error.message
        });
    }
});

module.exports = router;