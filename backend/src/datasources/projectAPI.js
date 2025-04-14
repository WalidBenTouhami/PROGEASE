// src/datasources/projectAPI.js

export class ProjectAPI {
    constructor() {
        this.cache = new Map();
        this.cacheTTL = 60000; // 1 minute
    }

    async getProjectWithTeam(projectId) {
        const cacheKey = `project-${projectId}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const project = await Project.findById(projectId)
            .populate({
                path: 'equipe',
                select: 'name email role',
                options: { lean: true }
            })
            .lean()
            .cache('1 hour');

        this.cache.set(cacheKey, project);
        setTimeout(() => this.cache.delete(cacheKey), this.cacheTTL);

        return project;
    }

    // Méthodes optimisées avec cache et pagination
    async getAllProjects(page = 1, limit = 10) {
        return Project.paginate({}, {
            page,
            limit,
            populate: [
                { path: 'equipe', select: 'name email' },
                { path: 'tuteur', select: 'name experience' }
            ],
            lean: true
        });
    }
}