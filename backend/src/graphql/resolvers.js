const Project = require('../models/project.model'); // Import Project model
const Deliverable = require('../models/project.model');

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
                        return project.deliverables;
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

                        if (!input.name || !input.description || !input.deadline || !input.repositoryUrl) {
                            throw new Error('All deliverable fields are required: name, description, deadline, repositoryUrl.');
                        }

                        project.deliverables.push(input);
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

                        const deliverable = project.deliverables.id(deliverableId);
                        if (!deliverable) {
                            throw new Error('Deliverable not found');
                        }

                        Object.assign(deliverable, input);
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

                        deliverable.remove();
                        await project.save();

                        return deliverable;
                    } catch (error) {
                        throw new Error('Failed to remove deliverable: ' + error.message);
                    }
                },
            },
        };

        module.exports = { resolvers };