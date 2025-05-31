// src/models/project.model.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Project title is required.'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Project description is required.'],
        trim: true,
    },
    status: {
        type: String,
        enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'],
        default: 'DRAFT'
    },
    team: {
        type: [Schema.Types.ObjectId], // Tableau d'ObjectId
        ref: 'User', // Référence au modèle User
        default: [],
    },
    tutor: {
        type: Schema.Types.ObjectId, // ObjectId unique
        ref: 'User', // Référence au modèle User
    },
    skills: {
        type: [String],
        validate: {
            validator: (arr) => arr.length > 0,
            message: 'Project must have at least one skill.',
        },
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required.'],
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required.'],
    },
    deliverables: [{
        type: Schema.Types.ObjectId,
        ref: 'Deliverable'
    }],
    evaluations: [{
        type: Schema.Types.ObjectId,
        ref: 'Evaluation'
    }],
    progression: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    averageScore: {
        type: Number,
        default: 0
    },
    predictedPerformance: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
projectSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Project', projectSchema);