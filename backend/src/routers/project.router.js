// src/routers/project.router.js

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { validateProject } = require('../middlewares/project.middleware');

// Routes pour le module "project"
router.post('/create', validateProject, projectController.createProject);
router.get('/all', projectController.getProjects);
router.put('/update/:id', validateProject, projectController.updateProject);
router.delete('/delete/:id', projectController.deleteProject);

module.exports = router;

