const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddlewares"); // Assurez-vous que le chemin est correct


const {
  createCertificat,
  verifierValiditeCertificat,
} = require("../controllers/certificationController");  
const { genererCertificat } = require("../controllers/formationController");

// Route pour creer un certificat
router.post('/', authMiddleware, createCertificat);  // Ajoutez le middleware ici

// Route pour generer un certificat
router.post('/generer', authMiddleware, genererCertificat);

// Verifier la validite du certificat
router.get('/:certificatId/verifier', authMiddleware, verifierValiditeCertificat); 

// Exporter le routeur
module.exports = router;
