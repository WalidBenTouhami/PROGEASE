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

// Apply rate limiting to forum routes
router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes pour les sujets
router.get('/sujets', forumController.recupererSujets);
router.get('/sujets/:sujetId', forumController.recupererSujetParId);
router.post('/sujets', verifierToken, validerCreationSujet, forumController.creerSujet);
router.put(
    '/sujets/:sujetId',
    verifierToken,
    estAuteurSujet,
    validerCreationSujet,
    forumController.modifierSujet
);
router.delete('/sujets/:sujetId', verifierToken, estAuteurSujet, forumController.supprimerSujet);

// Routes pour les réponses
router.post(
    '/sujets/:sujetId/reponses',
    verifierToken,
    validerCreationReponse,
    forumController.ajouterReponse
);
router.put(
    '/sujets/:sujetId/reponses/:reponseId',
    verifierToken,
    estAuteurReponse,
    validerCreationReponse,
    forumController.modifierReponse
);
router.delete(
    '/sujets/:sujetId/reponses/:reponseId',
    verifierToken,
    estAuteurReponse,
    forumController.supprimerReponse
);

// Routes pour les votes
router.post('/sujets/:sujetId/vote', verifierToken, forumController.voterSujet);
router.post(
    '/sujets/:sujetId/reponses/:reponseId/vote',
    verifierToken,
    forumController.voterReponse
);

// Route pour marquer une réponse comme solution
router.post(
    '/sujets/:sujetId/reponses/:reponseId/solution',
    verifierToken,
    estAuteurSujet,
    forumController.marquerCommeSolution
);

// Routes pour la recherche et le filtrage
router.get('/sujets/recherche', forumController.rechercherSujets);
router.get('/sujets/categorie/:categorie', forumController.recupererSujetsParCategorie);
router.get('/sujets/utilisateur/:utilisateurId', forumController.recupererSujetsParUtilisateur);

module.exports = router;
