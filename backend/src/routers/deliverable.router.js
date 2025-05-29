// src/routers/deliverable.router.js

const express = require('express');
const router = express.Router();
const deliverableController = require('../controllers/deliverable.controller');

// Add a deliverable
router.post('/', deliverableController.addDeliverable);

// Get all deliverables for a project
router.get('/:projectId', deliverableController.getDeliverables);

// Update a specific deliverable
router.put('/:deliverableId', deliverableController.updateDeliverable);

// Delete a specific deliverable
router.delete('/:deliverableId', deliverableController.removeDeliverable);

module.exports = router;


