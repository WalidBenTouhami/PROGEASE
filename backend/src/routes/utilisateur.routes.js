const express = require('express');
const router = express.Router();
const { rateLimiter } = require('../middlewares/rateLimiter');
const { 
    validerInscription,
    validerConnexion,
    validerMiseAJourProfil,
    validerChangementMotDePasse,
    verifierToken,
    verifierRole,
    verifierProprietaire,
    verifierEmailUnique,
    limiterTentativesConnexion
} = require('../middlewares/utilisateur.middleware');
const UtilisateurController = require('../controllers/utilisateur.controller');

// Routes publiques
router.post('/inscription', 
    rateLimiter({ windowMs: 60000, max: 10 }),
    validerInscription, 
    UtilisateurController.inscription
);

router.post('/connexion', 
    limiterTentativesConnexion,
    validerConnexion, 
    UtilisateurController.connexion
);

router.post('/mot-de-passe-oublie', 
    rateLimiter({ windowMs: 60000, max: 5 }),
    UtilisateurController.motDePasseOublie
);

router.post('/reinitialiser-mot-de-passe/:token', 
    rateLimiter({ windowMs: 60000, max: 10 }),
    UtilisateurController.reinitialiserMotDePasse
);

// Routes protégées nécessitant authentification
router.use(verifierToken);

// Gestion du profil utilisateur
router.get('/profil', 
    rateLimiter({ windowMs: 60000, max: 50 }),
    UtilisateurController.getProfil
);

router.put('/profil', 
    rateLimiter({ windowMs: 60000, max: 20 }),
    validerMiseAJourProfil, 
    verifierEmailUnique, 
    UtilisateurController.mettreAJourProfil
);

router.put('/changer-mot-de-passe', 
    rateLimiter({ windowMs: 60000, max: 10 }),
    validerChangementMotDePasse, 
    UtilisateurController.changerMotDePasse
);

// Routes administratives
router.get('/', 
    rateLimiter({ windowMs: 60000, max: 50 }),
    verifierRole('ADMIN'), 
    UtilisateurController.getAllUtilisateurs
);

router.get('/:id', 
    rateLimiter({ windowMs: 60000, max: 50 }),
    verifierRole('ADMIN'), 
    UtilisateurController.getUtilisateurById
);

router.put('/:id', 
    rateLimiter({ windowMs: 60000, max: 30 }),
    verifierRole('ADMIN'), 
    validerMiseAJourProfil, 
    verifierEmailUnique, 
    UtilisateurController.mettreAJourUtilisateur
);

router.delete('/:id', 
    rateLimiter({ windowMs: 60000, max: 20 }),
    verifierRole('ADMIN'), 
    UtilisateurController.supprimerUtilisateur
);

// Gestion des sessions
router.post('/deconnexion', 
    rateLimiter({ windowMs: 60000, max: 30 }),
    UtilisateurController.deconnexion
);

router.post('/rafraichir-token', 
    rateLimiter({ windowMs: 60000, max: 20 }),
    UtilisateurController.rafraichirToken
);

module.exports = router;