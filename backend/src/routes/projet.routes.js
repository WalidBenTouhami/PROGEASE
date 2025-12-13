// src/routes/projet.routes.js
const express = require('express');
const router = express.Router();
const projetController = require('../controllers/projet.controller');
const { validateRequest } = require('../middlewares/validateRequest');
const { 
    validateProjetData, 
    validateId, 
    validateStatistiquesRequest, 
    projetSchema, 
    signalementSchema 
} = require('../validations/projet.validation');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { rateLimiter } = require('../middlewares/rateLimiter');

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
            utilisateur: req.currentutilisateur || 'anonymous'
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
    rateLimiter({ windowMs: 60000, max: 30 }),
    validateRequest(projetSchema),
    asyncHandler(projetController.creerProjet)
);

/**
 * @route GET /api/projets/:id
 * @description Recuperer un projet par son ID
 * @access Public
 */
router.get('/:id',
    rateLimiter({ windowMs: 60000, max: 50 }),
    validateId('id'),
    asyncHandler(projetController.recupererProjetParId)
);

/**
 * @route PUT /api/projets/:id
 * @description Mettre à jour un projet
 * @access Public
 */
router.put('/:id',
    rateLimiter({ windowMs: 60000, max: 30 }),
    validateId('id'),
    validateRequest(projetSchema),
    asyncHandler(projetController.mettreAJourProjet)
);

/**
 * @route DELETE /api/projets/:id
 * @description Supprimer un projet
 * @access Public
 */
router.delete('/:id',
    rateLimiter({ windowMs: 60000, max: 20 }),
    validateId('id'),
    asyncHandler(projetController.supprimerProjet)
);

/**
 * @route GET /api/projets/:id/livrables
 * @description Recuperer les livrables d'un projet
 * @access Public
 */
router.get('/:id/livrables',
    rateLimiter({ windowMs: 60000, max: 50 }),
    validateId('id'),
    asyncHandler(async (req, res) => {
        const livrableController = require('../controllers/livrable.controller');
        req.params.projetId = req.params.id;
        await livrableController.findByProjet(req, res);
    })
);

/**
 * @route GET /api/projets/statistiques
 * @description Obtenir les statistiques des projets par thème et catégorie
 * @access Public
 */
router.get('/statistiques',
    rateLimiter({ windowMs: 60000, max: 30 }),  // max 30 requetes par minute
    validateStatistiquesRequest,
    asyncHandler(projetController.obtenirStatistiques)
);

/**
 * @route POST /api/projets/signalement
 * @description Signaler un problème sur un projet ou une tâche
 * @access Public
 */
router.post('/signalement',
    rateLimiter({ windowMs: 60000, max: 10 }),  // max 10 requetes par minute
    validateRequest(signalementSchema),
    asyncHandler(projetController.signalerProbleme)
);

module.exports = router;