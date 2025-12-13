const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddlewares'); // Assurez-vous que le chemin est correct
const { rateLimiter } = require('../middlewares/rateLimiter');

const {
    createCertificat,
    verifierValiditeCertificat,
} = require('../controllers/certificationController');
const { genererCertificat } = require('../controllers/formationController');

// Apply rate limiting to all certification routes
router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }));

// Route pour creer un certificat
router.post('/', authMiddleware, createCertificat); // Ajoutez le middleware ici

// Route pour generer un certificat
router.post('/generer', authMiddleware, genererCertificat);

// Verifier la validite du certificat
router.get('/:certificatId/verifier', authMiddleware, verifierValiditeCertificat);

// Exporter le routeur
module.exports = router;
