// src/modules/user-management/routes/UserRoutes.js

const express = require('express');  // Remplacer import par require
const { 
  createUser, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  registerUser, 
  loginUser, 
  verifyEmail 
} = require('../controllers/UserController.js');  // Remplacer import par require
const { verifyToken, authorizeRoles } = require('../middlewares/user.middleware.js');  // Remplacer import par require

const router = express.Router();

// Routes
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', verifyToken, authorizeRoles('admin'), updateUser);
router.delete('/users/:id', verifyToken, authorizeRoles('admin'), deleteUser);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail);

// Exporter le routeur avec module.exports
module.exports = router;
