const Project = require('../models/project.model'); // Import Project model
const Deliverable = require('../models/project.model'); // Import Deliverable model (if needed)

const resolvers = {
    Query: {
        // Retrieve all projects
        projects: async () => {
            try {
                return await Project.find();
            } catch (error) {
                throw new Error('Failed to fetch projects: ' + error.message);
            }
        },

        // Retrieve a single project by ID
        project: async (_, { id }) => {
            try {
                const project = await Project.findById(id);
                if (!project) {
                    throw new Error('Project not found');
                }
                return project;
            } catch (error) {
                throw new Error('Failed to fetch project: ' + error.message);
            }
        },

        // Retrieve all deliverables for a specific project
        deliverables: async (_, { projectId }) => {
            try {
                const project = await Project.findById(projectId);
                if (!project) {
                    throw new Error('Project not found');
                }
                return project.deliverables; // Assuming deliverables are stored as a subdocument/array in the Project model
            } catch (error) {
                throw new Error('Failed to fetch deliverables: ' + error.message);
            }
        },
    },

    Mutation: {
        // Create a new project
        createProject: async (_, { input }) => {
            try {
                const newProject = new Project(input);
                return await newProject.save();
            } catch (error) {
                throw new Error('Failed to create project: ' + error.message);
            }
        },

        // Update a project
        updateProject: async (_, { id, input }) => {
            try {
                const updatedProject = await Project.findByIdAndUpdate(id, input, { new: true, runValidators: true });
                if (!updatedProject) {
                    throw new Error('Project not found');
                }
                return updatedProject;
            } catch (error) {
                throw new Error('Failed to update project: ' + error.message);
            }
        },

        // Delete a project
        deleteProject: async (_, { id }) => {
            try {
                const deletedProject = await Project.findByIdAndDelete(id);
                if (!deletedProject) {
                    throw new Error('Project not found');
                }
                return deletedProject;
            } catch (error) {
                throw new Error('Failed to delete project: ' + error.message);
            }
        },

        // Add a deliverable to a project
        addDeliverable: async (_, { projectId, input }) => {
            try {
                const project = await Project.findById(projectId);
                if (!project) {
                    throw new Error('Project not found');
                }
                project.deliverables.push(input); // Assuming deliverables are stored as subdocuments
                await project.save();
                return project;
            } catch (error) {
                throw new Error('Failed to add deliverable: ' + error.message);
            }
        },

        // Update a specific deliverable of a project
        updateDeliverable: async (_, { projectId, deliverableId, input }) => {
            try {
                const project = await Project.findById(projectId);
                if (!project) {
                    throw new Error('Project not found');
                }
                const deliverable = project.deliverables.id(deliverableId); // Find deliverable by ID
                if (!deliverable) {
                    throw new Error('Deliverable not found');
                }
                Object.assign(deliverable, input); // Update deliverable fields
                await project.save();
                return deliverable;
            } catch (error) {
                throw new Error('Failed to update deliverable: ' + error.message);
            }
        },

        // Remove a specific deliverable from a project
        removeDeliverable: async (_, { projectId, deliverableId }) => {
            try {
                const project = await Project.findById(projectId);
                if (!project) {
                    throw new Error('Project not found');
                }
                const deliverable = project.deliverables.id(deliverableId);
                if (!deliverable) {
                    throw new Error('Deliverable not found');
                }
                deliverable.remove(); // Remove the deliverable
                await project.save();
                return deliverable;
            } catch (error) {
                throw new Error('Failed to remove deliverable: ' + error.message);
            }
        },
    },
};

module.exports = { resolvers };