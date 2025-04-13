const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    note: {
        type: Number,
        required: [true, 'Veuillez ajouter une note'],
        min: [0, 'La note ne peut pas être inférieure à 0'],
        max: [20, 'La note ne peut pas être supérieure à 20']
    },
    commentaires: {
        type: String
    },
    projetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Veuillez ajouter un ID de projet'],
        ref: 'Projet'
    },
    etudiantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur'
    },
    equipeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipe'
    },
    tuteurId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Veuillez ajouter un ID de tuteur'],
        ref: 'Utilisateur'
    },
    historique: [{
        note: Number,
        commentaires: String,
        modifiePar: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Utilisateur'
        },
        dateModification: {
            type: Date,
            default: Date.now
        }
    }],
    dateCreation: {
        type: Date,
        default: Date.now
    }
}, { timestamps: { createdAt: 'dateCreation', updatedAt: 'dateMiseAJour' } });

// Custom validation to ensure either studentId or equipeId is present, but not both
evaluationSchema.pre('validate', function(next) {
    if ((!this.etudiantId && !this.equipeId) || (this.etudiantId && this.equipeId)) {
        this.invalidate('etudiantId', 'Il faut soit un ID étudiant soit un ID équipe, mais pas les deux');
    }
    next();
});

module.exports = mongoose.model('Evaluation', evaluationSchema); 