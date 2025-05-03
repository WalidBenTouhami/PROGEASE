// src/routers/project.router.js

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller'); // Import project controllers

// Route for creating a new project
router.post('/', projectController.createProject);

// Route for retrieving all projects
router.get('/', projectController.getProjects);

// Route for retrieving a single project by ID
router.get('/:id', projectController.getProjectById);

// Route for updating a project
router.put('/:id', projectController.updateProject);

// Route for deleting a project
router.delete('/:id', projectController.deleteProject);

module.exports = router;