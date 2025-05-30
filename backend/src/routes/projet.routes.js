// src/routes/projet.routes.js
const express = require('express');
const router = express.Router();
const projetController = require('../controllers/projet.controller');
const { validateProjetData, validateId } = require('../validations/projet.validation');
const { asyncHandler } = require('../middleware/asyncHandler');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * @route GET /api/projets/health
 * @description Verifier la sante de l'API projets
 * @access Public
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Health check OK',
        data: {
            status: 'ok',
            service: 'projets-api',
            timestamp: new Date().toISOString(),
            user: req.currentUser || 'anonymous'
        }
    });
});

/**
 * @route GET /api/projets
 * @description Recuperer tous les projets avec filtrage et pagination
 * @access Public
 */
router.get('/',
    rateLimiter({ windowMs: 60000, max: 30 }),  // max 30 requetes par minute
    asyncHandler(projetController.recupererProjets)
);

/**
 * @route POST /api/projets
 * @description Creer un nouveau projet
 * @access Public
 */
router.post('/',
    validateProjetData,
    asyncHandler(projetController.creerProjet)
);

/**
 * @route GET /api/projets/:id
 * @description Recuperer un projet par son ID
 * @access Public
 */
router.get('/:id',
    validateId('id'),
    asyncHandler(projetController.recupererProjetParId)
);

/**
 * @route PUT /api/projets/:id
 * @description Mettre à jour un projet
 * @access Public
 */
router.put('/:id',
    validateId('id'),
    validateProjetData,
    asyncHandler(projetController.mettreAJourProjet)
);

/**
 * @route DELETE /api/projets/:id
 * @description Supprimer un projet
 * @access Public
 */
router.delete('/:id',
    validateId('id'),
    asyncHandler(projetController.supprimerProjet)
);

/**
 * @route POST /api/projets/analyse-risques
 * @description Analyser les risques d'un projet
 * @access Public
 */
router.post('/analyse-risques',
    rateLimiter({ windowMs: 300000, max: 10 }),  // max 10 requetes / 5min (plus lourd)
    validateId('projetId', 'body'),
    asyncHandler(projetController.analyserRisques)
);

/**
 * @route POST /api/projets/suivi-taches
 * @description Obtenir le suivi des tâches d'un projet
 * @access Public
 */
router.post('/suivi-taches',
    validateId('projetId', 'body'),
    asyncHandler(projetController.suiviTaches)
);

/**
 * @route GET /api/projets/:id/livrables
 * @description Recuperer les livrables d'un projet
 * @access Public
 */
router.get('/:id/livrables',
    validateId('id'),
    asyncHandler(async (req, res) => {
        const livrableController = require('../controllers/livrable.controller');
        req.params.projetId = req.params.id;
        await livrableController.findByProjet(req, res);
    })
);

module.exports = router;