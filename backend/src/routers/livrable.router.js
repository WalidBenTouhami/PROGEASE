const express = require('express');
const router = express.Router();
const deliverableController = require('../controllers/livrable.controller');

// Récupérer tous les livrables
router.get('/', deliverableController.recupererTousLivrables);

// Ajouter un livrable
router.post('/', deliverableController.ajouterLivrable);

// Récupérer tous les livrables d'un projet
router.get('/projet/:projetId', deliverableController.recupererLivrables);

// Récupérer un livrable par ID
router.get('/:livrableId', deliverableController.recupererLivrableParId);

// Mettre à jour un livrable
router.put('/:livrableId', deliverableController.mettreAJourLivrable);

// Supprimer un livrable
router.delete('/:livrableId', deliverableController.supprimerLivrable);

module.exports = router;