const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateur.controller');
const { validateUtilisateurData, validateId } = require('../validations/utilisateur.validation');
const { asyncHandler } = require('../middleware/asyncHandler');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * @route GET /api/utilisateurs/health
 * @description Vérifier la santé de l'API utilisateurs
 * @access Public
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Health check OK',
        data: {
            status: 'ok',
            service: 'utilisateurs-api',
            timestamp: new Date().toISOString()
        }
    });
});

/**
 * @route GET /api/utilisateurs
 * @description Récupérer tous les utilisateurs avec filtrage et pagination
 * @access Public
 */
router.get('/',
    rateLimiter({ windowMs: 60000, max: 30 }),  // max 30 requêtes par minute
    asyncHandler(utilisateurController.recupererUtilisateurs)
);

/**
 * @route POST /api/utilisateurs
 * @description Créer un nouvel utilisateur
 * @access Public
 */
router.post('/',
    validateUtilisateurData,
    asyncHandler(utilisateurController.creerUtilisateur)
);

/**
 * @route GET /api/utilisateurs/:id
 * @description Récupérer un utilisateur par son ID
 * @access Public
 */
router.get('/:id',
    validateId('id'),
    asyncHandler(utilisateurController.recupererUtilisateurParId)
);

/**
 * @route PUT /api/utilisateurs/:id
 * @description Mettre à jour un utilisateur
 * @access Public
 */
router.put('/:id',
    validateId('id'),
    validateUtilisateurData,
    asyncHandler(utilisateurController.mettreAJourUtilisateur)
);

/**
 * @route DELETE /api/utilisateurs/:id
 * @description Supprimer un utilisateur
 * @access Public
 */
router.delete('/:id',
    validateId('id'),
    asyncHandler(utilisateurController.supprimerUtilisateur)
);

module.exports = router;