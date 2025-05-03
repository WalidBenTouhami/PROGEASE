const mongoose = require('mongoose');
const { Schema } = mongoose;

// ✅ Sous-schéma pour les livrables
const deliverableSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Le nom du livrable est requis.'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La description du livrable est requise.'],
        trim: true
    },
    deadline: {
        type: Date,
        required: [true, 'La deadline est requise.'],
        validate: {
            validator: (v) => v > Date.now() + 86400000, // Minimum 24h dans le futur
            message: 'La deadline doit être au moins 24h dans le futur.'
        }
    },
    repositoryUrl: {
        type: String,
        required: true,
        validate: {
            validator: async function (url) {
                const pattern = /^https:\/\/github\.com\/[^/]+\/[^/]+$/;
                return pattern.test(url);
            },
            message: 'URL GitHub invalide ou dépôt inexistant.'
        }
    },
    statut: {
        type: String,
        enum: ['OVERDUE', 'PENDING', 'COMPLETED'],
        default: 'PENDING',
        required: [true, 'Le statut est requis.']
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

// ✅ Schéma principal pour le projet
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
    equipe: {
        // Simule une liste d'IDs au lieu de références au modèle `User`
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    tuteur: {
        // Simule un ObjectId au lieu d'une référence au modèle `User`
        type: mongoose.Schema.Types.ObjectId
    },
    skills: {
        type: [String],
        default: [],
        validate: {
            validator: (arr) => arr.length > 0,
            message: 'Le projet doit contenir au moins une compétence.'
        }
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
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

module.exports = mongoose.model('Project', projectSchema);