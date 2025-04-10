//src/modules/project-management/services/project.service.js

const Project = require('../models/project.model');
const Evaluation = require('../../evaluation-system/models/evaluation.model');
const IaService = require('../../../services/ia.service');
const { remindersQueue } = require('../../../utils/queue');
/**
 * Génère un rapport de synthèse du projet
 */
exports.generateReport = async (projectId) => {
    try {
        const project = await Project.findById(projectId)
            .populate('equipe', 'nom prenom role')
            .populate('evaluations', 'score evaluateur_id comments');

        if (!project) throw new Error('Projet non trouvé');

        return {
            title: project.titre,
            members: project.equipe.length,
            evaluationsCount: project.evaluations.length,
            progression: project.progression || 0,
            predictedPerformance: project.predictedPerformance || 0,
            report: `Rapport du projet ${project.titre} : ${project.equipe.length} membres, ${project.evaluations.length} évaluations, progression de ${project.progression}% prévue à ${project.predictedPerformance}%`
        };
    } catch (error) {
        throw new Error(`Erreur lors de la génération du rapport : ${error.message}`);
    }
};

/**
 * Met à jour automatiquement la progression d'un projet
 */
exports.updateProgression = async (projectId) => {
    try {
        const project = await Project.findById(projectId);
        if (!project) throw new Error('Projet non trouvé');

        const total = project.deliverables.length;
        const done = project.deliverables.filter(d => d.status === 'terminé').length;
        const progression = total > 0 ? Math.floor((done / total) * 100) : 0;

        project.progression = progression;
        await project.save();

        return progression;
    } catch (error) {
        throw new Error(`Erreur de mise à jour de la progression : ${error.message}`);
    }
};

/**
 * Prédit la performance d'un projet avec une règle simple (peut être remplacée par du ML)
 */
exports.predictPerformance = async (projectId) => {
    try {
        const project = await Project.findById(projectId)
            .populate('equipe', 'score experience')
            .populate('tuteur', 'experience');

        if (!project) throw new Error('Projet non trouvé');
        if (!project.equipe || project.equipe.length === 0) throw new Error("Aucune équipe définie");

        const averageTeamScore =
            project.equipe.reduce((sum, user) => sum + (user.score || 0), 0) / project.equipe.length;

        const tutorExperience = project.tuteur?.experience || 0;

        const prediction = Math.round(averageTeamScore * 0.7 + tutorExperience * 0.3);

        project.predictedPerformance = prediction;
        await project.save();

        return prediction;
    } catch (error) {
        throw new Error(`Erreur de prédiction des performances : ${error.message}`);
    }
};

/**
 * Ajoute un livrable à un projet
 */
exports.addDeliverableToProject = async (projectId, deliverableData) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Projet introuvable');

    const newDeliverable = {
        name: deliverableData.name,
        deadline: deliverableData.deadline,
        repositoryUrl: deliverableData.repositoryUrl,
        status: 'en attente'
    };

    project.deliverables.push(newDeliverable);
    await project.save();

    return newDeliverable;
};

/**
 * Récupère un projet par ID
 */
exports.getProjectById = async (projectId) => {
    return await Project.findById(projectId).lean();
};

/**
 * Met à jour un livrable
 */
exports.updateDeliverable = async (projectId, deliverableId, updateData) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Projet non trouvé');

    const deliverable = project.deliverables.id(deliverableId);
    if (!deliverable) throw new Error('Livrable non trouvé');

    if (updateData.name) deliverable.name = updateData.name;
    if (updateData.deadline) deliverable.deadline = updateData.deadline;
    if (updateData.repositoryUrl) deliverable.repositoryUrl = updateData.repositoryUrl;
    if (updateData.status) deliverable.status = updateData.status;

    await project.save();
    return deliverable;
};

/**
 * Supprime un livrable d'un projet
 */
exports.deleteDeliverable = async (projectId, deliverableId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Projet non trouvé');

    const deliverable = project.deliverables.id(deliverableId);
    if (!deliverable) throw new Error('Livrable non trouvé');

    deliverable.remove();
    await project.save();
};

// Ajouter un job
await remindersQueue.add('sendReminder', {
    emails: ['user@example.com'],
    deliverableName: 'Sprint 1',
    deadline: new Date()
});

// Surveiller les jobs
remindersQueue.on('progress', (job) => {
    console.log(`Job ${job.id} en cours : ${job.progress()}%`);
});