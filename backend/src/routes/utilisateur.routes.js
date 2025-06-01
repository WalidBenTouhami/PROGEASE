const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateur.controller');
const { validateUtilisateurData, validateId } = require('../validations/utilisateur.validation');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { rateLimiter } = require('../middlewares/rateLimiter');
const { verifierToken, verifierRole } = require('../middlewares/utilisateur.middleware');

// --- Routes de santé et CRUD classiques ---

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

router.get('/',
    rateLimiter({ windowMs: 60000, max: 30 }),
    asyncHandler(utilisateurController.getAllutilisateurs)
);

router.post('/',
    validateUtilisateurData,
    asyncHandler(utilisateurController.createutilisateur)
);

router.get('/:id',
    validateId('id'),
    asyncHandler(utilisateurController.getutilisateurById)
);

router.put('/:id',
    verifierToken, verifierRole(['admin']),
    validateId('id'),
    validateUtilisateurData,
    asyncHandler(utilisateurController.updateutilisateur)
);

router.delete('/:id',
    verifierToken, verifierRole(['admin']),
    validateId('id'),
    asyncHandler(utilisateurController.deleteutilisateur)
);

// --- Routes Authentification & Email ---

router.post('/register', asyncHandler(utilisateurController.registerutilisateur));
router.post('/login', asyncHandler(utilisateurController.loginutilisateur));
router.get('/verify-email', asyncHandler(utilisateurController.verifyEmail));

module.exports = router;