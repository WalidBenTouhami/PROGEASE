const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schéma pour les options de réponse
const optionSchema = new Schema({
    texte: {
        type: String,
        required: [true, 'Le texte de l\'option est requis'],
        trim: true,
        minlength: [1, 'L\'option doit contenir au moins 1 caractère']
    },
    estCorrecte: {
        type: Boolean,
        required: true,
        default: false
    },
    explication: {
        type: String,
        trim: true
    }
});

// Schéma pour les questions
const questionSchema = new Schema({
    texte: {
        type: String,
        required: [true, 'Le texte de la question est requis'],
        trim: true,
        minlength: [5, 'La question doit contenir au moins 5 caractères']
    },
    type: {
        type: String,
        required: true,
        enum: ['CHOIX_UNIQUE', 'CHOIX_MULTIPLE', 'VRAI_FAUX', 'TEXTE_LIBRE'],
        default: 'CHOIX_UNIQUE'
    },
    points: {
        type: Number,
        required: true,
        min: [1, 'La question doit valoir au moins 1 point'],
        default: 1
    },
    options: [optionSchema],
    explication: {
        type: String,
        trim: true
    },
    ordre: {
        type: Number,
        required: true
    }
});

// Schéma principal du quiz
const quizSchema = new Schema({
    titre: {
        type: String,
        required: [true, 'Le titre du quiz est requis'],
        trim: true,
        minlength: [5, 'Le titre doit contenir au moins 5 caractères'],
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description du quiz est requise'],
        trim: true,
        minlength: [10, 'La description doit contenir au moins 10 caractères']
    },
    formationId: {
        type: Schema.Types.ObjectId,
        ref: 'Formation',
        required: [true, 'La formation associée est requise']
    },
    moduleId: {
        type: Schema.Types.ObjectId,
        ref: 'Module'
    },
    auteur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: [true, 'L\'auteur est requis']
    },
    dureeEstimee: {
        type: Number,
        required: [true, 'La durée estimée est requise'],
        min: [1, 'La durée doit être supérieure à 0']
    },
    noteMinimale: {
        type: Number,
        required: true,
        min: [0, 'La note minimale ne peut pas être négative'],
        max: [100, 'La note maximale ne peut pas dépasser 100'],
        default: 60
    },
    tentativesMax: {
        type: Number,
        required: true,
        min: [1, 'Le nombre de tentatives doit être supérieur à 0'],
        default: 3
    },
    questions: [questionSchema],
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

// Schéma pour les résultats de quiz
const quizResultatSchema = new Schema({
    utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    reponses: [{
        question: {
            type: Schema.Types.ObjectId,
            required: true
        },
        reponsesDonnees: [{
            type: Schema.Types.ObjectId
        }],
        estCorrecte: {
            type: Boolean,
            required: true
        },
        points: {
            type: Number,
            required: true,
            default: 0
        }
    }],
    note: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    estReussi: {
        type: Boolean,
        required: true,
        default: false
    },
    tempsPasseEnSecondes: {
        type: Number,
        required: true,
        min: 0
    },
    numeroTentative: {
        type: Number,
        required: true,
        min: 1
    },
    dateDebut: {
        type: Date,
        required: true
    },
    dateFin: {
        type: Date,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'creeLe',
        updatedAt: 'majLe'
    }
});

// Index pour optimiser les recherches
quizSchema.index({ titre: 'text', description: 'text' });
quizSchema.index({ formationId: 1 });
quizSchema.index({ moduleId: 1 });
quizSchema.index({ auteur: 1 });
quizSchema.index({ estActif: 1 });

quizResultatSchema.index({ utilisateur: 1, quiz: 1 });
quizResultatSchema.index({ quiz: 1, dateDebut: -1 });
quizResultatSchema.index({ utilisateur: 1, estReussi: 1 });

// Virtual pour le nombre total de points du quiz
quizSchema.virtual('pointsTotal').get(function() {
    return this.questions.reduce((total, q) => total + q.points, 0);
});

// Virtual pour le nombre de questions
quizSchema.virtual('nombreQuestions').get(function() {
    return this.questions.length;
});

// Middleware pre-save
quizSchema.pre('save', function(next) {
    // Mettre à jour la date de modification
    this.majLe = new Date();
    
    // Vérifier qu'il y a au moins une option correcte par question
    for (const question of this.questions) {
        if (question.type !== 'TEXTE_LIBRE') {
            const optionsCorrectes = question.options.filter(opt => opt.estCorrecte);
            if (optionsCorrectes.length === 0) {
                next(new Error(`La question "${question.texte}" doit avoir au moins une option correcte`));
                return;
            }
            if (question.type === 'CHOIX_UNIQUE' && optionsCorrectes.length > 1) {
                next(new Error(`La question à choix unique "${question.texte}" ne peut avoir qu'une seule option correcte`));
                return;
            }
        }
    }
    
    next();
});

// Middleware pre-update
quizSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    this.set({ majLe: new Date() });
    next();
});

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizResultat = mongoose.model('QuizResultat', quizResultatSchema);

module.exports = {
    Quiz,
    QuizResultat
};