// backend/src/evaluation-system/models/evaluation.model.js

import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    evaluator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    criteria: {
        technical: { type: Number, min: 0, max: 100 },
        creativity: { type: Number, min: 0, max: 100 },
        presentation: { type: Number, min: 0, max: 100 }
    },
    comments: {
        type: String,
        maxlength: 1000
    },
    attachments: [{
        url: String,
        type: { type: String, enum: ['image', 'document'] }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

evaluationSchema.index({ project: 1, evaluator: 1 }, { unique: true });

export default mongoose.model('Evaluation', evaluationSchema);