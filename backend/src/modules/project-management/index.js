// src/modules/project-management/index.js

// 🎭 Contrôleurs
import * as projectController from './controllers/project.controller.js';

// 🛠️ Services
import * as projectService from './services/project.service.js';

// 🛡️ Middlewares
import * as projectMiddleware from './middlewares/project.middleware.js';

// 🚏 Routes
import projectRoutes from './routes/project.routes.js'; // Export par défaut

// 🏛️ Modèles
import Project from './models/project.model.js'; // Export par défaut

export {
    projectController,
    projectService,
    projectMiddleware,
    projectRoutes,
    Project
};