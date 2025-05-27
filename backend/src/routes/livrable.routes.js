// src/routes/livrable.routes.js
const express = require('express');
const router = express.Router();
const livrableController = require('../controllers/livrable.controller');
const { validateLivrableData, validateId } = require('../validations/livrable.validation');
const { asyncHandler } = require('../middleware/asyncHandler');
const rateLimiter = require('../middleware/rateLimiter');

/**
 * @route GET /api/livrables/health
 * @description Vérifier la santé de l'API livrables
 * @access Public
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'livrables-api',
        timestamp: new Date().toISOString(),
        user: req.currentUser || 'anonymous'
    });
});

/**
 * @route GET /api/livrables
 * @description Récupérer tous les livrables avec filtrage et pagination
 * @access Public
 */
router.get('/',
    rateLimiter({ windowMs: 60000, max: 30 }),  // max 30 requêtes par minute
    asyncHandler(livrableController.findAll)
);

/**
 * @route POST /api/livrables
 * @description Créer un nouveau livrable
 * @access Public
 */
router.post('/',
    validateLivrableData,
    asyncHandler(livrableController.create)
);

/**
 * @route GET /api/livrables/projet/:projetId
 * @description Récupérer tous les livrables d'un projet
 * @access Public
 */
router.get('/projet/:projetId',
    validateId('projetId'),
    asyncHandler(livrableController.findByProject)
);

/**
 * @route GET /api/livrables/:livrableId
 * @description Récupérer un livrable par ID
 * @access Public
 */
router.get('/:livrableId',
    validateId('livrableId'),
    asyncHandler(livrableController.findOne)
);

/**
 * @route PUT /api/livrables/:livrableId
 * @description Mettre à jour un livrable
 * @access Public
 */
router.put('/:livrableId',
    validateId('livrableId'),
    validateLivrableData,
    asyncHandler(livrableController.update)
);

/**
 * @route DELETE /api/livrables/:livrableId
 * @description Supprimer un livrable
 * @access Public
 */
router.delete('/:livrableId',
    validateId('livrableId'),
    asyncHandler(livrableController.delete)
);

module.exports = router;