// src/modules/project-management/models/project.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schéma principal du projet
const ProjectSchema = new Schema({
    id: {
        type: String,
        unique: true
    },
    titre: {
        type: String,
        required: [true, 'Le titre est requis'],
        trim: true,
        minlength: [3, 'Le titre doit faire au moins 3 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description est requise'],
        trim: true,
        minlength: [50, 'La description doit faire au moins 50 caractères']
    },
    dateDebut: {
        type: Date,
        required: [true, 'La date de début est requise'],
        validate: {
            validator: function (date) {
                return date > new Date(); // ✅ Correction : Vérifie que la date est future
            },
            message: 'La date de début doit être une date future'
        }
    },
    dateFin: {
        type: Date,
        required: [true, 'La date de fin est requise'],
        validate: [
            {
                validator: function (date) {
                    if (!this.dateDebut) return false;
                    const oneDay = 24 * 60 * 60 * 1000;
                    return date > new Date(this.dateDebut.getTime() + oneDay); // ✅ Correction : Ajoute 1 jour minimum
                },
                message: 'La date de fin doit être postérieure à la date de début + 1 jour'
            },
            {
                validator: function (date) {
                    const maxDuration = 90 * 24 * 60 * 60 * 1000; // Durée maximale de 90 jours
                    return this.dateDebut && (date - this.dateDebut) <= maxDuration;
                },
                message: 'La durée maximale du projet est de 90 jours'
            }
        ]
    },
    equipe: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: [true, 'L’équipe est requise'],
        validate: {
            validator: async function (value) {
                const users = await mongoose.model('User').find({ _id: { $in: value } });
                return users.length === value.length; // ✅ Correction : Vérifie que tous les membres existent
            },
            message: 'L’équipe contient des membres invalides'
        }
    },
    tuteur: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le tuteur est requis'],
        validate: {
            validator: async function (tuteurId) {
                const tutor = await mongoose.model('User').findById(tuteurId);
                return tutor?.role === 'tuteur' && tutor?.availability; // ✅ Correction : Disponibilité du tuteur
            },
            message: 'Le tuteur doit avoir le rôle "tuteur" et être disponible'
        }
    },
    status: {
        type: String,
        enum: ['en cours', 'soumis', 'évalué', 'terminé'],
        default: 'en cours'
    },
    deliverables: {
        type: [
            {
                name: {
                    type: String,
                    required: [true, 'Nom du livrable requis']
                },
                deadline: {
                    type: Date,
                    required: [true, 'Deadline requis'],
                    validate: {
                        validator: (date) => date > new Date(),
                        message: 'Le deadline doit être une date future'
                    }
                },
                status: {
                    type: String,
                    enum: ['en attente', 'terminé', 'en retard'],
                    default: 'en attente'
                },
                repositoryUrl: {
                    type: String,
                    required: [true, 'Lien GitHub requis'],
                    validate: {
                        validator: function (url) {
                            return /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(url);
                        },
                        message: 'Le lien GitHub n’est pas valide'
                    }
                }
            }
        ],
        default: []
    },
    evaluations: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Evaluation',
            required: true
        }
    ],
    predictedPerformance: {
        type: Number,
        default: 0
    },
    progression: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    skills: {
        type: [String],
        required: [true, 'Compétences requises pour le projet'],
        validate: {
            validator: (value) => value.length >= 1,
            message: 'Au moins une compétence doit être spécifiée'
        }
    }
}, {
    timestamps: true
});

// ✅ Middleware logique : cohérence des dates
ProjectSchema.pre('validate', function (next) {
    if (this.dateDebut && this.dateFin && this.dateFin <= this.dateDebut) {
        this.invalidate('dateFin', 'Les dates sont incohérentes');
    }
    next();
});

// ✅ Middleware pour générer un ID unique de projet
ProjectSchema.pre('save', async function (next) {
    if (!this.id) {
        const currentYear = new Date().getFullYear().toString().slice(-2); // ex: 24
        const level = '01'; // Niveau fixe
        const count = await mongoose.model('Project').countDocuments();
        const ranking = String(count + 1).padStart(4, '0'); // ex: 0005
        this.id = `${currentYear}${level}${ranking}`; // Exemple: 24010005
    }
    next();
});

// ✅ Index pour optimiser les recherches par date
ProjectSchema.index({ dateDebut: 1 });

module.exports = mongoose.model('Project', ProjectSchema);