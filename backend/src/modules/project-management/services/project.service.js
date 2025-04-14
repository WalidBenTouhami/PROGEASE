// src/modules/project-management/services/project.service.js

import Project from '../models/project.model.js';
import { redisClient } from '../../../utils/redis.js';
import { ProjectUtils } from '../utils/project.utils.js';

export class ProjectService {
    static async createProject(projectData) {
        const projectCode = ProjectUtils.generateProjectCode(projectData.team.length);
        const project = await Project.create({ ...projectData, code: projectCode });

        await redisClient.del('projects:all');
        return project;
    }

    static async getProjectById(id) {
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
    }

    static async updateProjectStatus(id, status) {
        return Project.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true, runValidators: true }
        );
    }

    static async calculateProjectHealth(id) {
        const project = await this.getProjectById(id);
        return {
            riskScore: ProjectUtils.calculateRiskScore(project),
            progress: project.progress,
            budgetHealth: project.budget / project.estimatedBudget
        };
    }
}