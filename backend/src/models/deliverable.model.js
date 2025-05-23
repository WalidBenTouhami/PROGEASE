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
        required: [true, 'Repository URL is required.'],
        trim: true,
        validate: {
            validator: (url) => /^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(url),
            message: 'Invalid GitHub repository URL.',
        },
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'LATE'],
        default: 'PENDING',
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project ID is required.'],
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

// Update the updatedAt timestamp before saving
deliverableSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Deliverable', deliverableSchema);