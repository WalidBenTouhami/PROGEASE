// src/modules/project-management/models/project.model.js

import mongoose from 'mongoose';
import User from '../../user-management/models/user.model.js';
import { checkGithubRepoExists } from '../../../services/github.service.js';

const { Schema } = mongoose;

const ProjectSchema = new Schema({
    titre: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    equipe: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    tuteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skills: [{ type: String, trim: true }],
    deliverables: {
        type: [{
            name: { type: String, required: true, trim: true },
            deadline: {
                type: Date,
                required: true,
                validate: {
                    validator: (v) => v > Date.now() + 86400000, // +24h
                    message: 'La deadline doit être au moins 24h dans le futur.'
                }
            },
            repositoryUrl: {
                type: String,
                validate: {
                    validator: async (url) => {
                        const pattern = /^https:\/\/github\.com\/[^/]+\/[^/]+$/;
                        return pattern.test(url) && await checkGithubRepoExists(url);
                    },
                    message: 'URL GitHub invalide ou dépôt inexistant.'
                }
            }
        }],
        default: []
    }
}, {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexation stratégique
ProjectSchema.index({
    titre: 'text',
    description: 'text',
    skills: 1
});

// Middleware de validation amélioré
ProjectSchema.pre('save', async function(next) {
    try {
        if (this.isModified('equipe')) {
            const existingUsers = await User.countDocuments({
                _id: { $in: this.equipe }
            });

            if (existingUsers !== this.equipe.length) {
                throw new Error('Un ou plusieurs membres de l\'équipe sont invalides.');
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model('Project', ProjectSchema);