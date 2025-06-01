const express = require('express');
const router = express.Router();
const { 
    validateInscription,
    validateConnexion,
    validateMiseAJourProfil,
    validateChangementMotDePasse,
    verifierToken,
    verifierRole,
    verifierProprietaire,
    verifierEmailUnique
} = require('../middlewares/utilisateur.middleware');
const UtilisateurController = require('../controllers/utilisateur.controller');

// Routes publiques
router.post('/inscription', validateInscription, UtilisateurController.inscription);
router.post('/connexion', validateConnexion, UtilisateurController.connexion);
router.post('/mot-de-passe-oublie', UtilisateurController.motDePasseOublie);
router.post('/reinitialiser-mot-de-passe/:token', UtilisateurController.reinitialiserMotDePasse);

// Routes protégées
router.use(verifierToken);

router.get('/profil', UtilisateurController.getProfil);
router.put('/profil', validateMiseAJourProfil, verifierEmailUnique, UtilisateurController.mettreAJourProfil);
router.put('/changer-mot-de-passe', validateChangementMotDePasse, UtilisateurController.changerMotDePasse);

// Routes admin
router.get('/', verifierRole('ADMIN'), UtilisateurController.getAllUtilisateurs);
router.get('/:id', verifierRole('ADMIN'), UtilisateurController.getUtilisateurById);
router.put('/:id', verifierRole('ADMIN'), validateMiseAJourProfil, verifierEmailUnique, UtilisateurController.mettreAJourUtilisateur);
router.delete('/:id', verifierRole('ADMIN'), UtilisateurController.supprimerUtilisateur);

module.exports = router;