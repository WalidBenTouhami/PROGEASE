const mongoose = require('mongoose');
const { Schema } = mongoose;

const evaluationCriteriaSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Le nom du critère est requis.']
    },
    score: {
        type: Number,
        required: [true, 'Le score est requis.'],
        min: [0, 'Le score ne peut pas être inférieur à 0.'],
        max: [20, 'Le score ne peut pas être supérieur à 20.']
    },
    weight: {
        type: Number,
        required: [true, 'Le poids est requis.'],
        min: [0, 'Le poids ne peut pas être inférieur à 0.'],
        max: [1, 'Le poids ne peut pas être supérieur à 1.']
    }
});

const evaluationSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'L\'ID du projet est requis.']
    },
    evaluatorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'ID de l\'évaluateur est requis.']
    },
    score: {
        type: Number,
        required: [true, 'Le score est requis.'],
        min: [0, 'Le score ne peut pas être inférieur à 0.'],
        max: [20, 'Le score ne peut pas être supérieur à 20.']
    },
    comments: {
        type: String,
        trim: true
    },
    criteria: [evaluationCriteriaSchema],
    aiRecommendations: {
        type: String,
        default: ''
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

// Add index for faster queries
evaluationSchema.index({ projectId: 1, evaluatorId: 1 });

// Pre-save middleware to update the updatedAt field
evaluationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Evaluation', evaluationSchema); 