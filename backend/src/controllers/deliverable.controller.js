// src/controllers/deliverable.controller.js

const Deliverable = require('../models/deliverable.model');
const Project = require('../models/project.model');

// Add a new deliverable
exports.addDeliverable = async (req, res) => {
    try {
        const { projectId, name, description, deadline, repositoryUrl } = req.body;

        // Verify the project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        // Create the deliverable
        const deliverable = new Deliverable({
            projectId,
            name,
            description,
            deadline,
            repositoryUrl,
        });

        const savedDeliverable = await deliverable.save();
        res.status(201).json(savedDeliverable);
    } catch (error) {
        console.error('Error adding deliverable:', error.message);
        res.status(500).json({ error: 'Failed to add deliverable.' });
    }
};

// Get all deliverables for a project
exports.getDeliverables = async (req, res) => {
    try {
        const { projectId } = req.params;

        const deliverables = await Deliverable.find({ projectId });
        if (!deliverables.length) {
            return res.status(404).json({ error: 'No deliverables found for this project.' });
        }

        res.status(200).json(deliverables);
    } catch (error) {
        console.error('Error fetching deliverables:', error.message);
        res.status(500).json({ error: 'Failed to fetch deliverables.' });
    }
};

// Update a specific deliverable
exports.updateDeliverable = async (req, res) => {
    try {
        const { deliverableId } = req.params;

        const updatedDeliverable = await Deliverable.findByIdAndUpdate(
            deliverableId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedDeliverable) {
            return res.status(404).json({ error: 'Deliverable not found.' });
        }

        res.status(200).json(updatedDeliverable);
    } catch (error) {
        console.error('Error updating deliverable:', error.message);
        res.status(500).json({ error: 'Failed to update deliverable.' });
    }
};

// Delete a specific deliverable
exports.removeDeliverable = async (req, res) => {
    try {
        const { deliverableId } = req.params;

        const deletedDeliverable = await Deliverable.findByIdAndDelete(deliverableId);
        if (!deletedDeliverable) {
            return res.status(404).json({ error: 'Deliverable not found.' });
        }

        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting deliverable:', error.message);
        res.status(500).json({ error: 'Failed to delete deliverable.' });
    }
};