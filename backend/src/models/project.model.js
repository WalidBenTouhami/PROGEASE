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
});

module.exports = mongoose.model('Project', projectSchema);