const projectService = require('../services/project.service');

/**
 * Crée un nouveau projet
 */
const createProject = async (req, res) => {
    try {
        const project = await projectService.createProject(req.body);
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Récupère tous les projets
 */
const getProjects = async (req, res) => {
    try {
        const projects = await projectService.getAllProjects();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Met à jour un projet existant
 */
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProject = await projectService.updateProject(id, req.body);
        if (!updatedProject) {
            return res.status(404).json({ error: 'Projet non trouvé.' });
        }
        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Supprime un projet
 */
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProject = await projectService.deleteProject(id);
        if (!deletedProject) {
            return res.status(404).json({ error: 'Projet non trouvé.' });
        }
        res.status(200).json({ message: 'Projet supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
};