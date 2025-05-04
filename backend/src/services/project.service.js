const Project = require('../models/project.model');

// ✅ Service pour créer un projet
exports.createProject = async (data) => {
    const project = new Project(data);
    return await project.save();
};

// ✅ Service pour récupérer tous les projets
exports.getAllProjects = async () => {
    return await Project.find().populate('equipe tuteur');
};

// ✅ Service pour récupérer un projet par ID
exports.getProjectById = async (id) => {
    return await Project.findById(id).populate('equipe tuteur deliverables');
};

// ✅ Service pour mettre à jour un projet
exports.updateProject = async (id, data) => {
    return await Project.findByIdAndUpdate(id, data, { new: true });
};

// ✅ Service pour supprimer un projet
exports.deleteProject = async (id) => {
    return await Project.findByIdAndDelete(id);
};

// ✅ Service pour ajouter un livrable
exports.addDeliverable = async (projectId, deliverableData) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Projet introuvable');
    project.deliverables.push(deliverableData);
    return await project.save();
};

// ✅ Service pour mettre à jour un livrable
exports.updateDeliverable = async (projectId, deliverableId, deliverableData) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Projet introuvable');
    const deliverable = project.deliverables.id(deliverableId);
    if (!deliverable) throw new Error('Livrable introuvable');
    Object.assign(deliverable, deliverableData);
    return await project.save();
};

// ✅ Service pour supprimer un livrable
exports.removeDeliverable = async (projectId, deliverableId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Projet introuvable');
    project.deliverables.id(deliverableId).remove();
    return await project.save();
};

// ✅ Service pour analyse des risques (Risk Analysis)
exports.analyzeRisks = async ({ projectDescription, milestones, resources }) => {
    if (!projectDescription) {
        throw new Error('La description du projet est requise pour l\'analyse des risques.');
    }

    // Simuler une analyse des risques
    const risks = [
        { risk: 'Manque de ressources', severity: 'Élevée', recommendation: 'Allouez des ressources supplémentaires.' },
        { risk: 'Retard dans les étapes clés', severity: 'Moyenne', recommendation: 'Revoir les échéances et les priorités.' },
        { risk: 'Défi technique', severity: 'Faible', recommendation: 'Planifiez une formation technique pour l\'équipe.' }
    ];

    return risks;
};

// ✅ Service pour suivi des tâches et rapport d'avancement (Task Tracking)
exports.trackTasks = async (tasks, filter = {}) => {
    if (!tasks || tasks.length === 0) {
        throw new Error('La liste des tâches est vide. Impossible de générer un rapport.');
    }

    // Appliquer les filtres si fournis
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filter.status ? task.status === filter.status : true;
        const matchesResponsible = filter.responsible ? task.responsible === filter.responsible : true;
        return matchesStatus && matchesResponsible;
    });

    // Calcul des indicateurs clés
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(task => task.status === 'Terminé').length;
    const inProgressTasks = filteredTasks.filter(task => task.status === 'En cours').length;
    const pendingTasks = filteredTasks.filter(task => task.status === 'À faire').length;
    const overdueTasks = filteredTasks.filter(task => new Date(task.deadline) < new Date()).length;

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        progressPercentage,
        tasks: filteredTasks
    };
};