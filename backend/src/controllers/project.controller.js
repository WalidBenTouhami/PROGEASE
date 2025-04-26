const Project = require('../models/project.model'); // Import the Mongoose model for projects

// Controller for creating a new project
exports.createProject = async (req, res) => {
    try {
        const project = new Project(req.body);
        const savedProject = await project.save();
        res.status(201).json(savedProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création du projet' });
    }
};

// Controller for retrieving all projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
    }
};

// Controller for retrieving a single project by ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération du projet' });
    }
};

// Controller for updating a project
exports.updateProject = async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProject) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }
        res.status(200).json(updatedProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du projet' });
    }
};

// Controller for deleting a project
exports.deleteProject = async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);
        if (!deletedProject) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
    }
};

// Controller for adding a deliverable to a project
exports.addDeliverable = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }

        const deliverable = {
            name: req.body.name,
            deadline: req.body.deadline,
            repositoryUrl: req.body.repositoryUrl,
            statut: 'PENDING', // Default status
        };

        project.deliverables.push(deliverable);
        await project.save();

        res.status(201).json(deliverable);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du livrable' });
    }
};

// Controller for retrieving all deliverables of a project
exports.getDeliverables = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }

        res.status(200).json(project.deliverables);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des livrables' });
    }
};

// Controller for updating a specific deliverable of a project
exports.updateDeliverable = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }

        const deliverable = project.deliverables.id(req.params.deliverableId);
        if (!deliverable) {
            return res.status(404).json({ error: 'Livrable introuvable' });
        }

        if (req.body.name) deliverable.name = req.body.name;
        if (req.body.statut) deliverable.statut = req.body.statut;

        await project.save();

        res.status(200).json(deliverable);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du livrable' });
    }
};

// Controller for removing a specific deliverable from a project
exports.removeDeliverable = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }

        const deliverable = project.deliverables.id(req.params.deliverableId);
        if (!deliverable) {
            return res.status(404).json({ error: 'Livrable introuvable' });
        }

        deliverable.remove();
        await project.save();

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression du livrable' });
    }
};