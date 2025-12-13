const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddlewares'); // Assurez-vous que le chemin est correct
const { rateLimiter } = require('../middlewares/rateLimiter');

const {
    createCertificat,
    verifierValiditeCertificat,
} = require('../controllers/certificationController');
const { genererCertificat } = require('../controllers/formationController');

// Route pour creer un certificat
router.post('/', rateLimiter({ windowMs: 60000, max: 20 }), authMiddleware, createCertificat); // Ajoutez le middleware ici

// Route pour generer un certificat
router.post(
    '/generer',
    rateLimiter({ windowMs: 60000, max: 10 }),
    authMiddleware,
    genererCertificat
);

// Verifier la validite du certificat
router.get(
    '/:certificatId/verifier',
    rateLimiter({ windowMs: 60000, max: 30 }),
    authMiddleware,
    verifierValiditeCertificat
);

// Exporter le routeur
module.exports = router;
