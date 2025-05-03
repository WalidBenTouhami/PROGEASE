const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller'); // Import project controllers


//------------------------------------------------------//
//       1.Routes for project management                //
//------------------------------------------------------//

// Route for creating a new project
router.post('/', projectController.createProject);

// Route for retrieving all projects
router.get('/', projectController.getProjects);

// Route for retrieving a single project by ID
router.get('/:id', projectController.getProjectById);

// Route for updating a project
router.put('/:id', projectController.updateProject);

// Route for deleting a project
router.delete('/:id', projectController.deleteProject);

//------------------------------------------------------//
// 2.Routes for deliverables management within a project//
//------------------------------------------------------//

// Route for adding a deliverable to a project
router.post('/:id/deliverables', projectController.addDeliverable);

// Route for retrieving all deliverables of a project
router.get('/:id/deliverables', projectController.getDeliverables);

// Route for updating a specific deliverable of a project
router.put('/:id/deliverables/:deliverableId', projectController.updateDeliverable);

// Route for removing a specific deliverable from a project
router.delete('/:id/deliverables/:deliverableId', projectController.removeDeliverable);

module.exports = router;