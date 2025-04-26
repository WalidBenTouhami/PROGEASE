// src/controllers/project.controller.js

const Project = require('../models/project.model');

// ✅ Créer un projet
const createProject = async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Récupérer tous les projets
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('equipe tuteur');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Récupérer un projet par ID
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id).populate('equipe tuteur deliverables');
        if (!project) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Mettre à jour un projet
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByIdAndUpdate(id, req.body, { new: true });
        if (!project) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Supprimer un projet
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }
        res.status(200).json({ message: 'Projet supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Ajouter un livrable à un projet
const addDeliverable = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }
        project.deliverables.push(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Mettre à jour un livrable
const updateDeliverable = async (req, res) => {
    try {
        const { id, deliverableId } = req.params;
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }
        const deliverable = project.deliverables.id(deliverableId);
        if (!deliverable) {
            return res.status(404).json({ error: 'Livrable introuvable' });
        }
        Object.assign(deliverable, req.body);
        await project.save();
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Supprimer un livrable
const removeDeliverable = async (req, res) => {
    try {
        const { id, deliverableId } = req.params;
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }
        project.deliverables.id(deliverableId).remove();
        await project.save();
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addDeliverable,
    updateDeliverable,
    removeDeliverable,
};