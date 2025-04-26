const express = require('express');
const projectController = require('../controllers/project.controller');

const router = express.Router();

// ✅ Routes pour les projets
router.post('/', projectController.createProject); // Créer un projet
router.get('/', projectController.getProjects); // Récupérer tous les projets
router.get('/:id', projectController.getProjectById); // Récupérer un projet par ID
router.put('/:id', projectController.updateProject); // Mettre à jour un projet
router.delete('/:id', projectController.deleteProject); // Supprimer un projet

// ✅ Routes pour les livrables
router.post('/:id/deliverables', projectController.addDeliverable); // Ajouter un livrable à un projet
router.put('/:id/deliverables/:deliverableId', projectController.updateDeliverable); // Mettre à jour un livrable
router.delete('/:id/deliverables/:deliverableId', projectController.removeDeliverable); // Supprimer un livrable

module.exports = router;