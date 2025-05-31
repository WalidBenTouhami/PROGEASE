// src/modules/utilisateur-management/routes/utilisateurRoutes.js

const express = require('express');  // Remplacer import par require
const { 
  createutilisateur, 
  getAllutilisateurs, 
  getutilisateurById, 
  updateutilisateur, 
  deleteutilisateur, 
  registerutilisateur, 
  loginutilisateur, 
  verifyEmail 
} = require('../controllers/utilisateurController.js');  // Remplacer import par require
const { verifyToken, authorizeRoles } = require('../middlewares/utilisateur.middleware.js');  // Remplacer import par require

const router = express.Router();

// Routes
router.post('/utilisateurs', createutilisateur);
router.get('/utilisateurs', getAllutilisateurs);
router.get('/utilisateurs/:id', getutilisateurById);
router.put('/utilisateurs/:id', verifyToken, authorizeRoles('admin'), updateutilisateur);
router.delete('/utilisateurs/:id', verifyToken, authorizeRoles('admin'), deleteutilisateur);
router.post('/register', registerutilisateur);
router.post('/login', loginutilisateur);
router.get('/verify-email', verifyEmail);

// Exporter le routeur avec module.exports
module.exports = router;
