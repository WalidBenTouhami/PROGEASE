// src/services/ia.service.js

import Project from '../models/Project.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

export const matchTutor = async (projectId) => {
    if (!projectId) {
        throw new Error('L\'identifiant du projet est requis.');
    }

    try {
        // 📌 Récupération des compétences du projet
        const project = await Project.findById(projectId)
            .select('skills')
            .lean();

        if (!project) {
            throw new Error(`Projet avec l'ID ${projectId} introuvable.`);
        }

        // 📌 Recherche des tuteurs correspondants
        return await User.aggregate([
            {
                $match: {
                    role: 'tuteur',
                    availability: true,
                    skills: { $in: project.skills }
                }
            },
            {
                $addFields: {
                    skillMatchCount: {
                        $size: { $setIntersection: [project.skills, '$skills'] }
                    },
                    experienceWeight: { $multiply: ['$experience', 0.1] }
                }
            },
            {
                $sort: {
                    skillMatchCount: -1,
                    experienceWeight: -1
                }
            },
            { $limit: 3 }
        ]);
    } catch (error) {
        logger.error(`Erreur lors de la correspondance des tuteurs : ${error.message}`);
        throw error;
    }
};