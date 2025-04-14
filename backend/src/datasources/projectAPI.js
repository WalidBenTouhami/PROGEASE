// src/datasources/projectAPI.js

import { logger } from '../utils/logger.js';
import Project from '../modules/project-management/models/project.model.js';

const CACHE_TTL = 60000; // 1 minute

export class ProjectAPI {
    constructor() {
        this.cache = new Map();
    }

    async getProjectWithTeam(projectId) {
        if (!projectId) {
            throw new Error('L\'identifiant du projet est requis.');
        }

        const cacheKey = `project-${projectId}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const project = await Project.findById(projectId)
                .populate({
                    path: 'equipe',
                    select: 'name email role',
                    options: { lean: true }
                })
                .lean();

            if (!project) {
                throw new Error(`Projet avec l'ID ${projectId} introuvable.`);
            }

            this.cache.set(cacheKey, project);
            setTimeout(() => this.cache.delete(cacheKey), CACHE_TTL);

            return project;
        } catch (error) {
            logger.error(`Erreur lors de la récupération du projet ${projectId} : ${error.message}`);
            throw error;
        }
    }

    async getAllProjects(page = 1, limit = 10) {
        if (page <= 0 || limit <= 0) {
            throw new Error('Les paramètres de pagination doivent être supérieurs à 0.');
        }

        try {
            return await Project.paginate({}, {
                page,
                limit,
                populate: [
                    { path: 'equipe', select: 'name email' },
                    { path: 'tuteur', select: 'name experience' }
                ],
                lean: true
            });
        } catch (error) {
            logger.error(`Erreur lors de la récupération des projets : ${error.message}`);
            throw error;
        }
    }
}