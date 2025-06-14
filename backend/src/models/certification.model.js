const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Enums } = require('../../config/constants');

const certificationSchema = new Schema({
    titre: {
        type: String,
        required: [true, 'Le titre de la certification est requis'],
        trim: true,
        minlength: [5, 'Le titre doit contenir au moins 5 caractères'],
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description de la certification est requise'],
        trim: true,
        minlength: [20, 'La description doit contenir au moins 20 caractères']
    },
    niveau: {
        type: String,
        required: true,
        enum: {
            values: Object.values(Enums.NiveauFormation),
            message: 'Niveau de certification invalide'
        }
    },
    image: {
        type: String,
        default: 'default-certification.jpg'
    },
    conditions: {
        formationsRequises: [{
            formation: {
                type: Schema.Types.ObjectId,
                ref: 'Formation',
                required: true
            },
            noteMinimale: {
                type: Number,
                required: true,
                min: [0, 'La note minimale ne peut pas être négative'],
                max: [100, 'La note maximale ne peut pas dépasser 100'],
                default: 70
            }
        }],
        quizFinal: {
            type: Schema.Types.ObjectId,
            ref: 'Quiz'
        },
        noteMinimaleQuizFinal: {
            type: Number,
            min: [0, 'La note minimale ne peut pas être négative'],
            max: [100, 'La note maximale ne peut pas dépasser 100'],
            default: 70
        },
        projetFinal: {
            type: Schema.Types.ObjectId,
            ref: 'Projet'
        }
    },
    competencesValidees: [{
        type: String,
        trim: true
    }],
    dureeValidite: {
        type: Number,
        required: [true, 'La durée de validité est requise'],
        min: [1, 'La durée de validité doit être supérieure à 0'],
        default: 365 // En jours
    },
    prix: {
        montant: {
            type: Number,
            required: true,
            min: [0, 'Le prix ne peut pas être négatif']
        },
        devise: {
            type: String,
            required: true,
            enum: ['EUR', 'USD', 'GBP'],
            default: 'EUR'
        }
    },
    estActif: {
        type: Boolean,
        default: true
    },
    creeLe: {
        type: Date,
        default: Date.now
    },
    majLe: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: {
        createdAt: 'creeLe',
        updatedAt: 'majLe'
    }
});

// Schéma pour les certifications obtenues
const certificationObtenuSchema = new Schema({
    certification: {
        type: Schema.Types.ObjectId,
        ref: 'Certification',
        required: true
    },
    utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    statut: {
        type: String,
        required: true,
        enum: {
            values: Object.values(Enums.StatutCertification),
            message: 'Statut de certification invalide'
        },
        default: Enums.StatutCertification.NON_COMMENCE
    },
    dateObtention: {
        type: Date
    },
    dateExpiration: {
        type: Date
    },
    numeroUnique: {
        type: String,
        unique: true,
        index: true
    },
    formationsTerminees: [{
        formation: {
            type: Schema.Types.ObjectId,
            ref: 'Formation'
        },
        dateCompletion: {
            type: Date,
            required: true
        },
        note: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    }],
    quizFinalResultat: {
        type: Schema.Types.ObjectId,
        ref: 'QuizResultat'
    },
    projetFinalResultat: {
        type: Schema.Types.ObjectId,
        ref: 'Projet'
    },
    creeLe: {
        type: Date,
        default: Date.now
    },
    majLe: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: {
        createdAt: 'creeLe',
        updatedAt: 'majLe'
    }
});

// Index pour optimiser les recherches
certificationSchema.index({ titre: 'text', description: 'text' });
certificationSchema.index({ niveau: 1 });
certificationSchema.index({ estActif: 1 });
certificationSchema.index({ 'conditions.formationsRequises.formation': 1 });

certificationObtenuSchema.index({ certification: 1, utilisateur: 1 }, { unique: true });
certificationObtenuSchema.index({ utilisateur: 1 });
certificationObtenuSchema.index({ statut: 1 });
certificationObtenuSchema.index({ dateExpiration: 1 });

// Middleware pre-save pour certification obtenue
certificationObtenuSchema.pre('save', function(next) {
    // Générer un numéro unique si nouveau document
    if (this.isNew) {
        const date = new Date();
        const annee = date.getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.numeroUnique = `CERT-${annee}-${random}`;
    }
    
    // Mettre à jour la date de modification
    this.majLe = new Date();
    
    next();
});

// Middleware pre-update
certificationSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    this.set({ majLe: new Date() });
    next();
});

certificationObtenuSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    this.set({ majLe: new Date() });
    next();
});

const Certification = mongoose.model('Certification', certificationSchema);
const CertificationObtenu = mongoose.model('CertificationObtenu', certificationObtenuSchema);

module.exports = {
    Certification,
    CertificationObtenu
};