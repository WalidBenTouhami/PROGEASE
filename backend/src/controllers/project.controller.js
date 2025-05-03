// scr/controllers/project.controller.js

const Project = require('../models/project.model'); // Import the Mongoose model for projects

// Controller for creating a new project
exports.createProject = async (req, res) => {
    try {
        const project = new Project(req.body);
        const savedProject = await project.save();
        res.status(201).json(savedProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project.' });
    }
};

// Controller for retrieving all projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error retrieving projects:', error);
        res.status(500).json({ error: 'Failed to retrieve projects.' });
    }
};

// Controller for retrieving a single project by ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error('Error retrieving project by ID:', error);
        res.status(500).json({ error: 'Failed to retrieve project.' });
    }
};

// Controller for updating a project
exports.updateProject = async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Ensure validators are enforced during updates
        );
        if (!updatedProject) {
            return res.status(404).json({ error: 'Project not found.' });
        }
        res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project.' });
    }
};

// Controller for deleting a project
exports.deleteProject = async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);
        if (!deletedProject) {
            return res.status(404).json({ error: 'Project not found.' });
        }
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project.' });
    }
};