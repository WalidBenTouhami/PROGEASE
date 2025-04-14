// src/modules/project-management/models/project.model.js

const ProjectSchema = new Schema({
    // ... autres champs
    deliverables: {
        type: [{
            name: { type: String, required: true },
            deadline: {
                type: Date,
                validate: {
                    validator: function(v) {
                        return v > Date.now() + 86400000; // +24h
                    },
                    message: 'Deadline doit être au moins 24h dans le futur'
                }
            },
            repositoryUrl: {
                type: String,
                validate: {
                    validator: async function(url) {
                        const pattern = /^https:\/\/github.com\/[^/]+\/[^/]+$/;
                        return pattern.test(url) &&
                            await checkGithubRepoExists(url);
                    },
                    message: 'URL GitHub invalide ou repo privé'
                }
            }
        }]
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
    if (this.isModified('equipe')) {
        const existingUsers = await User.countDocuments({
            _id: { $in: this.equipe }
        });

        if (existingUsers !== this.equipe.length) {
            throw new Error('Un ou plusieurs membres invalides');
        }
    }
    next();
});