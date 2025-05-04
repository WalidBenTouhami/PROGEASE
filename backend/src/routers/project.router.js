const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller'); // Import project controllers
const { analyzeRisks, trackTasks } = require('../services/project.service'); // Import project services

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

// Route for Risk Analysis
router.post('/risk-analysis', async (req, res) => {
    try {
        const { projectDescription, milestones, resources } = req.body;
        const risks = await analyzeRisks({ projectDescription, milestones, resources });
        res.status(200).json(risks);
    } catch (error) {
        console.error('Error in /risk-analysis:', error.message);
        res.status(500).json({ error: 'Failed to analyze risks.' });
    }
});

// Route for Task Tracking and Progress Reporting
router.post('/task-tracking', async (req, res) => {
    try {
        const { tasks, filter } = req.body;
        const taskReport = await trackTasks(tasks, filter);
        res.status(200).json(taskReport);
    } catch (error) {
        console.error('Error in /task-tracking:', error.message);
        res.status(500).json({ error: 'Failed to track tasks.' });
    }
});

module.exports = router;