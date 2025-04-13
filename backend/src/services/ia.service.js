// src/services/ia.service.js

const mongoose = require('mongoose');
const Project = require('../modules/project-management/models/project.model');
const User = require('../modules/user-management/models/User.js');
const EmailService = require('./email.service');
const schedule = require('node-schedule');
const { createBullQueue } = require('../utils/queue'); // Nouveau: système de file d'attente

// 🔧 Configuration
const MIN_SKILL_SIMILARITY = 30; // Nouveau: seuil configurable
const REMINDER_OFFSET = 24 * 60 * 60 * 1000; // 24h en ms

// 🔍 Calcul de similarité optimisé avec Set
const calculateSkillSimilarity = (projectSkills = [], tutorSkills = []) => {
    const projectSet = new Set(projectSkills);
    const tutorSet = new Set(tutorSkills);
    const intersection = [...projectSet].filter(skill => tutorSet.has(skill));

    return (intersection.length / Math.max(projectSkills.length, 1)) * 100;
};

// 🛠 Utilitaire de validation d'ID
const validateProjectId = (projectId) => {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error(`ID de projet invalide: ${projectId}`);
    }
};

// 📊 Suivi d'avancement avec aggregation pipeline
exports.trackProgress = async (projectId) => {
    validateProjectId(projectId);

    const result = await Project.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(projectId) } },
        { $project: {
                progression: {
                    $floor: {
                        $multiply: [
                            100,
                            { $divide: [
                                    { $size: { $filter: {
                                                input: '$deliverables',
                                                as: 'd',
                                                cond: { $eq: ['$$d.status', 'terminé'] }
                                            }} },
                                    { $max: [{ $size: '$deliverables' }, 1] }
                                ]}
                        ]
                    }
                }
            }
        }
    ]);

    if (!result.length) throw new Error('Projet non trouvé');

    await Project.updateOne({ _id: projectId }, { progression: result[0].progression });
    return result[0].progression;
};

// 🔮 Prédiction de performance optimisée
exports.predictPerformance = async (projectId) => {
    validateProjectId(projectId);

    const [project] = await Project.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(projectId) } },
        { $lookup: {
                from: 'users',
                localField: 'equipe',
                foreignField: '_id',
                as: 'equipe'
            }
        },
        { $lookup: {
                from: 'users',
                localField: 'tuteur',
                foreignField: '_id',
                as: 'tuteur'
            }
        },
        { $addFields: {
                averageTeamScore: { $avg: '$equipe.score' },
                tutorExperience: { $arrayElemAt: ['$tuteur.experience', 0] }
            }
        },
        { $project: {
                predictedPerformance: {
                    $add: [
                        { $multiply: ['$averageTeamScore', 0.7] },
                        { $multiply: ['$tutorExperience', 0.3] }
                    ]
                }
            }
        }
    ]);

    if (!project) throw new Error('Projet non trouvé');

    await Project.updateOne(
        { _id: projectId },
        { $set: { predictedPerformance: project.predictedPerformance } }
    );

    return project.predictedPerformance;
};

// 👥 Appariement des tuteurs avec indexation
exports.matchTutor = async (projectId) => {
    validateProjectId(projectId);

    const project = await Project.findById(projectId)
        .select('skills')
        .lean();

    if (!project) throw new Error('Projet non trouvé');

    const bestMatch = await User.aggregate([
        { $match: {
                role: 'tuteur',
                availability: true,
                skills: { $in: project.skills }
            }
        },
        { $addFields: {
                similarity: calculateSkillSimilarity(project.skills, '$skills')
            }
        },
        { $sort: { similarity: -1 } },
        { $limit: 1 }
    ]);

    if (!bestMatch.length) {
        throw new Error('Aucun tuteur compétent disponible');
    }

    return bestMatch[0];
};

// 📅 Planification avec système de file d'attente
const reminderQueue = createBullQueue('reminders');

exports.setupReminders = async (projectId) => {
    validateProjectId(projectId);

    const project = await Project.findById(projectId)
        .select('deliverables')
        .populate('equipe', 'email');

    if (!project) throw new Error('Projet non trouvé');

    for (const deliverable of project.deliverables) {
        if (deliverable.deadline <= new Date()) continue;

        const jobData = {
            deliverableName: deliverable.name,
            deadline: deliverable.deadline,
            emails: project.equipe.map(u => u.email)
        };

        // Planification avec réessai automatique
        await reminderQueue.add(jobData, {
            delay: deliverable.deadline.getTime() - Date.now() - REMINDER_OFFSET,
            attempts: 3,
            backoff: 60000 // 1 minute entre les tentatives
        });
    }
};

// 📊 Génération de rapport avec template
exports.generateProgressReport = async (projectId) => {
    validateProjectId(projectId);

    const [project] = await Project.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(projectId) } },
        { $project: {
                name: 1,
                total: { $size: '$deliverables' },
                completed: {
                    $size: {
                        $filter: {
                            input: '$deliverables',
                            as: 'd',
                            cond: { $eq: ['$$d.status', 'terminé'] }
                        }
                    }
                }
            }
        }
    ]);

    if (!project) throw new Error('Projet non trouvé');

    const progression = Math.floor((project.completed / (project.total || 1)) * 100);
    const report = `
    <h1>Rapport d'Avancement</h1>
    <p>Projet: ${project.name}</p>
    <p>Progression: ${progression}%</p>
    <p>Livrables terminés: ${project.completed}/${project.total}</p>
  `;

    await EmailService.sendHtmlReport(
        project.equipe.map(u => u.email),
        `Rapport d'Avancement : ${project.name}`,
        report
    );

    return report;
};