const express = require('express');
const router = express.Router();
const projetController = require('../controllers/projet.controller');
const { validateProjetData, validateId } = require('../validations/projet.validation');
const { asyncHandler } = require('../middleware/asyncHandler');
const rateLimiter = require('../middleware/rateLimiter');

/**
 * @route POST /api/projets
 * @description Créer un nouveau projet
 * @access Public
 */
router.post('/',
    validateProjetData,
    asyncHandler(projetController.creerProjet)
);

/**
 * @route GET /api/projets
 * @description Récupérer tous les projets avec filtrage et pagination
 * @access Public
 */
router.get('/',
    rateLimiter({ windowMs: 60000, max: 30 }),  // max 30 requêtes par minute
    asyncHandler(projetController.recupererProjets)
);

/**
 * @route GET /api/projets/:id
 * @description Récupérer un projet par son ID
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
    rateLimiter({ windowMs: 300000, max: 10 }),  // max 10 requêtes / 5min (plus lourd)
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
 * @description Récupérer les livrables d'un projet
 * @access Public
 */
router.get('/:id/livrables',
    validateId('id'),
    asyncHandler(async (req, res) => {
        const livrableController = require('../controllers/livrable.controller');
        await livrableController.findByProject(req, res);
    })
);

/**
 * @route GET /api/projets/health
 * @description Vérifier la santé de l'API projets
 * @access Public
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        time: new Date().toISOString(),
        user: req.currentUser || 'anonymous',
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;