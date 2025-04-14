// src/modules/project-management/services/project.service.js

import Project from '../models/project.model.js';
import { redisClient } from '../../../utils/redis.js';
import { ProjectUtils } from '../utils/project.utils.js';

export class ProjectService {
    static async createProject(projectData) {
        try {
            const projectCode = ProjectUtils.generateProjectCode(projectData.team.length);
            const project = await Project.create({ ...projectData, code: projectCode });

            await redisClient.del('projects:all');
            return project;
        } catch (error) {
            throw new Error(`Erreur lors de la création du projet : ${error.message}`);
        }
    }

    static async getProjectById(id) {
        try {
            const cacheKey = `project:${id}`;
            const cached = await redisClient.get(cacheKey);

            if (cached) return JSON.parse(cached);

            const project = await Project.findById(id)
                .populate('team lead')
                .lean();

            if (project) {
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(project));
            }

            return project;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération du projet : ${error.message}`);
        }
    }

    static async updateProjectStatus(id, status) {
        try {
            return await Project.findByIdAndUpdate(
                id,
                { $set: { status } },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du statut : ${error.message}`);
        }
    }

    static async calculateProjectHealth(id) {
        try {
            const project = await this.getProjectById(id);
            return {
                riskScore: ProjectUtils.calculateRiskScore(project),
                progress: project.progress,
                budgetHealth: project.budget / project.estimatedBudget
            };
        } catch (error) {
            throw new Error(`Erreur lors du calcul de la santé du projet : ${error.message}`);
        }
    }
}