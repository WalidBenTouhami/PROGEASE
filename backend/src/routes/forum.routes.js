const express = require('express');
const router = express.Router();
const { verifierToken } = require('../middleware/utilisateur.middleware');
const {
    estAuteurSujet,
    estAuteurReponse,
    validerCreationSujet,
    validerCreationReponse,
} = require('../middleware/forum.middleware');
const forumController = require('../controllers/forum.controller');
const { rateLimiter } = require('../middlewares/rateLimiter');

// Routes pour les sujets
router.get('/sujets', rateLimiter({ windowMs: 60000, max: 50 }), forumController.recupererSujets);
router.get(
    '/sujets/:sujetId',
    rateLimiter({ windowMs: 60000, max: 50 }),
    forumController.recupererSujetParId
);
router.post(
    '/sujets',
    rateLimiter({ windowMs: 60000, max: 20 }),
    verifierToken,
    validerCreationSujet,
    forumController.creerSujet
);
router.put(
    '/sujets/:sujetId',
    rateLimiter({ windowMs: 60000, max: 30 }),
    verifierToken,
    estAuteurSujet,
    validerCreationSujet,
    forumController.modifierSujet
);
router.delete(
    '/sujets/:sujetId',
    rateLimiter({ windowMs: 60000, max: 20 }),
    verifierToken,
    estAuteurSujet,
    forumController.supprimerSujet
);

// Routes pour les réponses
router.post(
    '/sujets/:sujetId/reponses',
    rateLimiter({ windowMs: 60000, max: 30 }),
    verifierToken,
    validerCreationReponse,
    forumController.ajouterReponse
);
router.put(
    '/sujets/:sujetId/reponses/:reponseId',
    rateLimiter({ windowMs: 60000, max: 30 }),
    verifierToken,
    estAuteurReponse,
    validerCreationReponse,
    forumController.modifierReponse
);
router.delete(
    '/sujets/:sujetId/reponses/:reponseId',
    rateLimiter({ windowMs: 60000, max: 20 }),
    verifierToken,
    estAuteurReponse,
    forumController.supprimerReponse
);

// Routes pour les votes
router.post(
    '/sujets/:sujetId/vote',
    rateLimiter({ windowMs: 60000, max: 50 }),
    verifierToken,
    forumController.voterSujet
);
router.post(
    '/sujets/:sujetId/reponses/:reponseId/vote',
    rateLimiter({ windowMs: 60000, max: 50 }),
    verifierToken,
    forumController.voterReponse
);

// Route pour marquer une réponse comme solution
router.post(
    '/sujets/:sujetId/reponses/:reponseId/solution',
    rateLimiter({ windowMs: 60000, max: 30 }),
    verifierToken,
    estAuteurSujet,
    forumController.marquerCommeSolution
);

// Routes pour la recherche et le filtrage
router.get(
    '/sujets/recherche',
    rateLimiter({ windowMs: 60000, max: 50 }),
    forumController.rechercherSujets
);
router.get(
    '/sujets/categorie/:categorie',
    rateLimiter({ windowMs: 60000, max: 50 }),
    forumController.recupererSujetsParCategorie
);
router.get(
    '/sujets/utilisateur/:utilisateurId',
    rateLimiter({ windowMs: 60000, max: 50 }),
    forumController.recupererSujetsParUtilisateur
);

module.exports = router;
