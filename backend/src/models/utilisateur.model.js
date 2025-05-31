const mongoose = require('mongoose');
const { Schema } = mongoose;

const utilisateurSchema = new Schema({
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
    },
    role: {
        type: String,
        enum: ['ADMIN', 'TUTEUR', 'ETUDIANT'],
        default: 'ETUDIANT'
    },
    projets: [{
        type: Schema.Types.ObjectId,
        ref: 'Projet'
    }],
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

// Middleware pre-save pour mettre à jour majLe
utilisateurSchema.pre('save', function(next) {
    this.majLe = new Date();
    next();
});

// Méthode pour vérifier si l'utilisateur est admin
utilisateurSchema.methods.estAdmin = function() {
    return this.role === 'ADMIN';
};

// Méthode pour vérifier si l'utilisateur est tuteur
utilisateurSchema.methods.estTuteur = function() {
    return this.role === 'TUTEUR';
};

// Méthode pour vérifier si l'utilisateur est étudiant
utilisateurSchema.methods.estEtudiant = function() {
    return this.role === 'ETUDIANT';
};

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;