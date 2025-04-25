//src/models/project.model.js

const mongoose = require('mongoose');
const User = require('../models/user.model');
const { checkGithubRepoExists } = require('../services/github.service');

const { Schema } = mongoose;

// ✅ Sous-schéma pour les livrables
const deliverableSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Le nom du livrable est requis.'],
        trim: true
    },
    deadline: {
        type: Date,
        required: [true, 'La deadline est requise.'],
        validate: {
            validator: (v) => v > Date.now() + 86400000,
            message: 'La deadline doit être au moins 24h dans le futur.'
        }
    },
    repositoryUrl: {
        type: String,
        required: true,
        validate: {
            validator: async function (url) {
                const pattern = /^https:\/\/github\.com\/[^/]+\/[^/]+$/;
                if (!pattern.test(url)) return false;

                try {
                    return await checkGithubRepoExists(url);
                } catch (err) {
                    console.warn('⚠️ Erreur GitHub API :', err.message);
                    return false;
                }
            },
            message: 'URL GitHub invalide ou dépôt inexistant.'
        }
    }
});

// ✅ Schéma principal
const projectSchema = new Schema({
    titre: {
        type: String,
        required: [true, 'Le titre est requis.'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La description est requise.'],
        trim: true
    },
    equipe: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'équipe est requise.']
    }],
    tuteur: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le tuteur est requis.']
    },
    skills: {
        type: [String],
        default: [],
        validate: {
            validator: (arr) => arr.length > 0,
            message: 'Le projet doit contenir au moins une compétence.'
        }
    },
    deliverables: {
        type: [deliverableSchema],
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

// ✅ Virtuel pour `skillsText` (concatène les compétences pour l'indexation textuelle)
projectSchema.virtual('skillsText').get(function () {
    return this.skills?.join(' ') || '';
});

// ✅ Indexation textuelle (titre, description et compétences concaténées)
projectSchema.index({
    titre: 'text',
    description: 'text',
    skillsText: 'text'
});

// ✅ Validation des membres d’équipe avant sauvegarde
projectSchema.pre('save', async function (next) {
    if (this.isModified('equipe')) {
        const existingUsers = await User.countDocuments({
            _id: { $in: this.equipe }
        });

        if (existingUsers !== this.equipe.length) {
            return next(new Error("Un ou plusieurs membres de l'équipe sont invalides."));
        }
    }
    next();
});

module.exports = mongoose.model('Project', projectSchema);