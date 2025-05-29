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