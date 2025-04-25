// src/modules/project-management/services/project.service.js

const Project = require('../models/project.model');

/**
 * Crée un nouveau projet
 * @param {Object} projectData Les données du projet à créer
 * @returns {Object} Le projet créé
 */
const createProject = async (projectData) => {
    const project = new Project(projectData);
    return await project.save();
};

/**
 * Récupère tous les projets
 * @returns {Array} La liste des projets
 */
const getAllProjects = async () => {
    return await Project.find().populate('team tutor').lean();
};

/**
 * Met à jour un projet existant
 * @param {String} projectId L'ID du projet à mettre à jour
 * @param {Object} updateData Les données de mise à jour
 * @returns {Object} Le projet mis à jour
 */
const updateProject = async (projectId, updateData) => {
    return await Project.findByIdAndUpdate(projectId, updateData, { new: true });
};

/**
 * Supprime un projet
 * @param {String} projectId L'ID du projet à supprimer
 * @returns {Object} Le projet supprimé
 */
const deleteProject = async (projectId) => {
    return await Project.findByIdAndDelete(projectId);
};

module.exports = {
    createProject,
    getAllProjects,
    updateProject,
    deleteProject,
};