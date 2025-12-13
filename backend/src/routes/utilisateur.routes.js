const express = require('express');
const router = express.Router();
const {
    validerInscription,
    validerConnexion,
    validerMiseAJourProfil,
    validerChangementMotDePasse,
    verifierToken,
    verifierRole,
    verifierEmailUnique,
    limiterTentativesConnexion,
} = require('../middlewares/utilisateur.middleware');
const UtilisateurController = require('../controllers/utilisateur.controller');

// Routes publiques
router.post('/inscription', validerInscription, UtilisateurController.inscription);

router.post(
    '/connexion',
    limiterTentativesConnexion,
    validerConnexion,
    UtilisateurController.connexion
);

router.post('/mot-de-passe-oublie', UtilisateurController.motDePasseOublie);

router.post('/reinitialiser-mot-de-passe/:token', UtilisateurController.reinitialiserMotDePasse);

// Routes protégées nécessitant authentification
router.use(verifierToken);

// Gestion du profil utilisateur
router.get('/profil', UtilisateurController.getProfil);

router.put(
    '/profil',
    validerMiseAJourProfil,
    verifierEmailUnique,
    UtilisateurController.mettreAJourProfil
);

router.put(
    '/changer-mot-de-passe',
    validerChangementMotDePasse,
    UtilisateurController.changerMotDePasse
);

// Routes administratives
router.get('/', verifierRole('ADMIN'), UtilisateurController.getAllUtilisateurs);

router.get('/:id', verifierRole('ADMIN'), UtilisateurController.getUtilisateurById);

router.put(
    '/:id',
    verifierRole('ADMIN'),
    validerMiseAJourProfil,
    verifierEmailUnique,
    UtilisateurController.mettreAJourUtilisateur
);

router.delete('/:id', verifierRole('ADMIN'), UtilisateurController.supprimerUtilisateur);

// Gestion des sessions
router.post('/deconnexion', UtilisateurController.deconnexion);

router.post('/rafraichir-token', UtilisateurController.rafraichirToken);

module.exports = router;
