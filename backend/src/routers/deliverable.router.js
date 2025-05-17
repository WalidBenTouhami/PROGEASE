const express = require('express');
const router = express.Router();
const deliverableController = require('../controllers/deliverable.controller');

// Ajouter un livrable
router.post('/', deliverableController.ajouterLivrable);

// Récupérer tous les livrables d'un projet
router.get('/:projetId', deliverableController.recupererLivrables);

// Mettre à jour un livrable
router.put('/:livrableId', deliverableController.mettreAJourLivrable);

// Supprimer un livrable
router.delete('/:livrableId', deliverableController.supprimerLivrable);

module.exports = router;