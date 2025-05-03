// src/models/deliverable.model.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Deliverable Schema
const deliverableSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Deliverable name is required.'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Deliverable description is required.'],
        trim: true,
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required.'],
        validate: {
            validator: (v) => v > Date.now() + 86400000, // At least 24h in the future
            message: 'Deadline must be at least 24 hours in the future.',
        },
    },
    repositoryUrl: {
        type: String,
        required: true,
        validate: {
            validator: (url) => /^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(url),
            message: 'Invalid GitHub repository URL.',
        },
    },
    status: {
        type: String,
        enum: ['OVERDUE', 'PENDING', 'COMPLETED'],
        default: 'PENDING',
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Deliverable', deliverableSchema);