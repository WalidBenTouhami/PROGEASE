// src/models/Formation.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Enums } = require('../../config/constants');

const moduleSchema = new Schema({
    titre: {
        type: String,
        required: [true, 'Le titre du module est requis'],
        trim: true,
        minlength: [5, 'Le titre doit contenir au moins 5 caractères'],
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },
    description: {
        type: String,
        required: [true, 'La description du module est requise'],
        trim: true,
        minlength: [20, 'La description doit contenir au moins 20 caractères'],
    },
    ordre: {
        type: Number,
        required: true,
        min: [1, "L'ordre doit être supérieur à 0"],
    },
    duree: {
        type: Number,
        required: [true, 'La durée du module est requise'],
        min: [1, 'La durée doit être supérieure à 0'],
    },
    contenu: {
        videos: [
            {
                titre: {
                    type: String,
                    required: true,
                    trim: true,
                },
                url: {
                    type: String,
                    required: true,
                    trim: true,
                },
                duree: {
                    type: Number,
                    required: true,
                    min: [1, 'La durée doit être supérieure à 0'],
                },
            },
        ],
        documents: [
            {
                titre: {
                    type: String,
                    required: true,
                    trim: true,
                },
                url: {
                    type: String,
                    required: true,
                    trim: true,
                },
                type: {
                    type: String,
                    required: true,
                    enum: ['PDF', 'DOCX', 'PPTX', 'XLSX', 'AUTRE'],
                },
            },
        ],
        quiz: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Quiz',
            },
        ],
    },
    estObligatoire: {
        type: Boolean,
        default: true,
    },
});

const formationSchema = new Schema(
    {
        titre: {
            type: String,
            required: [true, 'Le titre de la formation est requis'],
            trim: true,
            minlength: [5, 'Le titre doit contenir au moins 5 caractères'],
            maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
        },
        description: {
            type: String,
            required: [true, 'La description de la formation est requise'],
            trim: true,
            minlength: [20, 'La description doit contenir au moins 20 caractères'],
        },
        type: {
            type: String,
            required: true,
            enum: {
                values: Object.values(Enums.TypeFormation),
                message: 'Type de formation invalide',
            },
        },
        niveau: {
            type: String,
            required: true,
            enum: {
                values: Object.values(Enums.NiveauFormation),
                message: 'Niveau de formation invalide',
            },
        },
        categorie: {
            type: String,
            required: [true, 'La catégorie est requise'],
            enum: [
                'DEVELOPPEMENT_WEB',
                'DEVELOPPEMENT_MOBILE',
                'DEVOPS',
                'INTELLIGENCE_ARTIFICIELLE',
                'SCIENCE_DONNEES',
                'GESTION_PROJET',
                'SECURITE',
                'CLOUD',
                'BASE_DONNEES',
                'AUTRE',
            ],
        },
        image: {
            type: String,
            default: 'default-formation.jpg',
        },
        dureeEstimee: {
            type: Number,
            required: [true, 'La durée estimée est requise'],
            min: [1, 'La durée doit être supérieure à 0'],
        },
        prerequis: [
            {
                type: String,
                trim: true,
            },
        ],
        objectifs: [
            {
                type: String,
                trim: true,
            },
        ],
        modules: [moduleSchema],
        formateur: {
            type: Schema.Types.ObjectId,
            ref: 'Utilisateur',
            required: [true, 'Le formateur est requis'],
        },
        participants: [
            {
                utilisateur: {
                    type: Schema.Types.ObjectId,
                    ref: 'Utilisateur',
                },
                dateInscription: {
                    type: Date,
                    default: Date.now,
                },
                progression: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 100,
                },
                modulesTermines: [
                    {
                        type: Schema.Types.ObjectId,
                        ref: 'Module',
                    },
                ],
                dernierAcces: {
                    type: Date,
                },
            },
        ],
        evaluations: [
            {
                utilisateur: {
                    type: Schema.Types.ObjectId,
                    ref: 'Utilisateur',
                },
                note: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
                commentaire: {
                    type: String,
                    trim: true,
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        estPublie: {
            type: Boolean,
            default: false,
        },
        datePublication: {
            type: Date,
        },
        creeLe: {
            type: Date,
            default: Date.now,
        },
        majLe: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: {
            createdAt: 'creeLe',
            updatedAt: 'majLe',
        },
    }
);

// Index pour optimiser les recherches
formationSchema.index({ titre: 'text', description: 'text' });
formationSchema.index({ categorie: 1 });
formationSchema.index({ niveau: 1 });
formationSchema.index({ type: 1 });
formationSchema.index({ estPublie: 1 });
formationSchema.index({ formateur: 1 });
formationSchema.index({ 'participants.utilisateur': 1 });

// Virtual pour la note moyenne
formationSchema.virtual('noteMoyenne').get(function () {
    if (!this.evaluations || this.evaluations.length === 0) return 0;
    const somme = this.evaluations.reduce((acc, eval) => acc + eval.note, 0);
    return Math.round((somme / this.evaluations.length) * 10) / 10;
});

// Virtual pour le nombre de participants
formationSchema.virtual('nombreParticipants').get(function () {
    return this.participants ? this.participants.length : 0;
});

// Middleware pre-save
formationSchema.pre('save', function (next) {
    this.majLe = new Date();

    // Calculer la durée totale estimée
    if (this.isModified('modules')) {
        this.dureeEstimee = this.modules.reduce((total, module) => total + module.duree, 0);
    }

    next();
});

// Middleware pre-update
formationSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
    this.set({ majLe: new Date() });
    next();
});

module.exports = mongoose.model('Formation', formationSchema);
