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

// Definition des routes pour les formations
router.post('/', rateLimiter({ windowMs: 60000, max: 20 }), createFormation); // Route pour creer une formation
router.get('/', rateLimiter({ windowMs: 60000, max: 50 }), getAllFormations); // Route pour recuperer toutes les formations
router.post(
    '/:formationId/ajouter-utilisateur',
    rateLimiter({ windowMs: 60000, max: 30 }),
    addutilisateurToFormation
); // Route pour ajouter un utilisateur à une formation
router.post(
    '/:formationId/ajouter-module',
    rateLimiter({ windowMs: 60000, max: 30 }),
    addModuleToFormation
); // Route pour ajouter un module à une formation
router.get('/:formationId', rateLimiter({ windowMs: 60000, max: 50 }), getFormationById); // Route pour ajouter un module à une formation

module.exports = router; // Exporte le routeur
