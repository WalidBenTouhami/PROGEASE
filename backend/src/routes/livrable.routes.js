// src/routes/livrable.routes.js
const express = require('express');
const router = express.Router();
const livrableController = require('../controllers/livrable.controller');
const { validateLivrableData, validateId } = require('../validations/livrable.validation');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { rateLimiter } = require('../middlewares/rateLimiter');

/**
 * @route GET /api/livrables/health
 * @description Verifier la sante de l'API livrables
 * @access Public
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Health check OK',
        data: {
            status: 'ok',
            service: 'livrables-api',
            timestamp: new Date().toISOString(),
            utilisateur: req.currentutilisateur || 'anonymous',
        },
    });
});

/**
 * @route GET /api/livrables
 * @description Recuperer tous les livrables avec filtrage et pagination
 * @access Public
 */
router.get(
    '/',
    rateLimiter({ windowMs: 60000, max: 30 }), // max 30 requetes par minute
    asyncHandler(livrableController.findAll)
);

/**
 * @route POST /api/livrables
 * @description Creer un nouveau livrable
 * @access Public
 */
router.post(
    '/',
    rateLimiter({ windowMs: 60000, max: 30 }),
    validateLivrableData,
    asyncHandler(livrableController.create)
);

/**
 * @route GET /api/livrables/projet/:projetId
 * @description Recuperer tous les livrables d'un projet
 * @access Public
 */
router.get(
    '/projet/:projetId',
    validateId('projetId'),
    asyncHandler(livrableController.findByProjet)
);

/**
 * @route GET /api/livrables/:livrableId
 * @description Recuperer un livrable par ID
 * @access Public
 */
router.get('/:livrableId', validateId('livrableId'), asyncHandler(livrableController.findOne));

/**
 * @route PUT /api/livrables/:livrableId
 * @description Mettre à jour un livrable
 * @access Public
 */
router.put(
    '/:livrableId',
    rateLimiter({ windowMs: 60000, max: 30 }),
    validateId('livrableId'),
    validateLivrableData,
    asyncHandler(livrableController.update)
);

/**
 * @route DELETE /api/livrables/:livrableId
 * @description Supprimer un livrable
 * @access Public
 */
router.delete(
    '/:livrableId',
    rateLimiter({ windowMs: 60000, max: 10 }),
    validateId('livrableId'),
    asyncHandler(livrableController.delete)
);

module.exports = router;
