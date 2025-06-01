const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const { Enums } = require('../../config/constants');

const utilisateurSchema = new Schema({
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
        minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
        maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    prenom: {
        type: String,
        required: [true, 'Le prénom est requis'],
        trim: true,
        minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
        maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
    },
    motDePasse: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
        select: false // Ne pas inclure par défaut dans les requêtes
    },
    role: {
        type: String,
        enum: Object.values(Enums.UtilisateurRole),
        default: Enums.UtilisateurRole.ETUDIANT
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    estActif: {
        type: Boolean,
        default: true
    },
    emailVerifie: {
        type: Boolean,
        default: false
    },
    dateEmailVerifie: {
        type: Date
    },
    projets: [{
        type: Schema.Types.ObjectId,
        ref: 'Projet'
    }],
    formations: [{
        type: Schema.Types.ObjectId,
        ref: 'Formation'
    }],
    certifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Certification'
    }],
    derniereConnexion: {
        type: Date
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
utilisateurSchema.index({ email: 1 });
utilisateurSchema.index({ role: 1 });

// Middleware pre-save pour hasher le mot de passe
utilisateurSchema.pre('save', async function(next) {
    if (!this.isModified('motDePasse')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
        this.majLe = new Date();
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour comparer les mots de passe
utilisateurSchema.methods.comparerMotDePasse = async function(motDePasse) {
    return await bcrypt.compare(motDePasse, this.motDePasse);
};

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

// Méthode pour mettre à jour la dernière connexion
utilisateurSchema.methods.mettreAJourDerniereConnexion = function() {
    this.derniereConnexion = new Date();
    return this.save();
};

// Méthode pour masquer le mot de passe lors de la sérialisation
utilisateurSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.motDePasse;
    return obj;
};

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;