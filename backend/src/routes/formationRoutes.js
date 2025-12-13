const express = require('express');
const router = express.Router();
const { rateLimiter } = require('../middlewares/rateLimiter');

// Importation des fonctions du contrôleur formationController
const {
    createFormation, // Creer une formation
    getAllFormations, // Recuperer toutes les formations
    addutilisateurToFormation, // Ajouter un utilisateur à une formation
    addModuleToFormation, // Ajouter un module à une formation
    getFormationById,
} = require('../controllers/formationController'); // Verifiez que le chemin d'importation est correct

// Apply rate limiting to all formation routes
router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));

// Definition des routes pour les formations
router.post('/', createFormation); // Route pour creer une formation
router.get('/', getAllFormations); // Route pour recuperer toutes les formations
router.post('/:formationId/ajouter-utilisateur', addutilisateurToFormation); // Route pour ajouter un utilisateur à une formation
router.post('/:formationId/ajouter-module', addModuleToFormation); // Route pour ajouter un module à une formation
router.get('/:formationId', getFormationById); // Route pour ajouter un module à une formation

module.exports = router; // Exporte le routeur
