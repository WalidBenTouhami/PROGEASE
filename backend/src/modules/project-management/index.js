// src/modules/project-management/index.js

// 🎭 Contrôleurs
const projectController = require('./controllers/project.controller');

// 🛠️ Services
const projectService = require('./services/project.service');

// 🛡️ Middlewares
const projectMiddleware = require('./middlewares/project.middleware');

// 🚏 Routes
const projectRoutes = require('./routes/project.routes');

// 🏛️ Modèles
const Project = require('./models/project.model');

module.exports = {
    projectController,
    projectService,
    projectMiddleware,
    projectRoutes,
    Project
};
