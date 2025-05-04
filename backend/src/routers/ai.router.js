// src/routers/ai.router.js

const express = require('express');
const router = express.Router();
const {
    generateText,
    trackProgress,
    predictPerformance,
    scheduleTasks,
    buildTeams,
    matchTutors,
    recommendLearning
} = require('../services/ai.service');

// Middleware for handling async errors
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Utility function to validate required fields
const validateField = (field, req, res) => {
    if (!req.body[field]) {
        res.status(400).json({ error: `The field "${field}" is required.` });
        return false;
    }
    return true;
};

// Endpoint: Generate Text with AI
router.post('/generate-text', catchAsync(async (req, res) => {
    if (!validateField('prompt', req, res)) return;
    const result = await generateText(req.body.prompt);
    res.status(200).json({ result });
}));

// Endpoint: Track Project Progress
router.post('/track-progress', catchAsync(async (req, res) => {
    if (!validateField('tasks', req, res)) return;
    const progress = await trackProgress(req.body.tasks);
    res.status(200).json({ progress });
}));

// Endpoint: Predict Performance
router.post('/predict-performance', catchAsync(async (req, res) => {
    if (!validateField('history', req, res)) return;
    const prediction = await predictPerformance(req.body.history);
    res.status(200).json({ prediction });
}));

// Endpoint: Generate Optimized Task Schedule
router.post('/schedule-tasks', catchAsync(async (req, res) => {
    if (!validateField('tasks', req, res)) return;
    const schedule = await scheduleTasks(req.body.tasks);
    res.status(200).json({ schedule });
}));

// Endpoint: Build Teams
router.post('/build-teams', catchAsync(async (req, res) => {
    if (!validateField('members', req, res)) return;
    const teams = await buildTeams(req.body.members);
    res.status(200).json({ teams });
}));

// Endpoint: Match Mentors and Mentees
router.post('/match-tutors', catchAsync(async (req, res) => {
    if (!validateField('members', req, res)) return;
    const pairs = await matchTutors(req.body.members);
    res.status(200).json({ pairs });
}));

// Endpoint: Recommend Learning Resources
router.post('/recommend-learning', catchAsync(async (req, res) => {
    if (!validateField('skills', req, res)) return;
    const resources = await recommendLearning(req.body.skills);
    res.status(200).json({ resources });
}));

// Global Error Handling Middleware
router.use((err, req, res, next) => {
    console.error('❌ Error caught in global middleware:', err);
    res.status(500).json({ error: 'An internal error occurred. Please try again later.' });
});

module.exports = router;