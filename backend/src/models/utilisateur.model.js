const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const config = require('../config');

const utilisateurSchema = new Schema(
    {
        nom: {
            type: String,
            required: [true, 'Le nom est requis'],
            trim: true,
            minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
            maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
        },
        prenom: {
            type: String,
            required: [true, 'Le prénom est requis'],
            trim: true,
            minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
            maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères'],
        },
        email: {
            type: String,
            required: [true, "L'email est requis"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Veuillez fournir un email valide',
            ],
            index: true,
        },
        motDePasse: {
            type: String,
            required: [true, 'Le mot de passe est requis'],
            minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
            select: false,
        },
        role: {
            type: String,
            enum: ['ADMIN', 'TUTEUR', 'ETUDIANT'],
            default: 'ETUDIANT',
            index: true,
        },
        avatar: {
            type: String,
            default: 'avatar-par-defaut.png',
        },
        actif: {
            type: Boolean,
            default: true,
            index: true,
        },
        emailVerifie: {
            type: Boolean,
            default: false,
        },
        dateEmailVerifie: {
            type: Date,
        },
        projets: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Projet',
            },
        ],
        formations: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Formation',
            },
        ],
        certifications: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Certification',
            },
        ],
        derniereConnexion: {
            type: Date,
        },
        tentativesConnexion: {
            type: Number,
            default: 0,
        },
        dateBlocage: {
            type: Date,
        },
        preferences: {
            theme: {
                type: String,
                enum: ['clair', 'sombre', 'systeme'],
                default: 'systeme',
            },
            notifications: {
                email: {
                    type: Boolean,
                    default: true,
                },
                push: {
                    type: Boolean,
                    default: true,
                },
            },
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
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.motDePasse;
                delete ret.__v;
                return ret;
            },
        },
        toObject: {
            virtuals: true,
        },
    }
);

// Index composé pour optimiser les recherches
utilisateurSchema.index({ email: 1, role: 1 });
utilisateurSchema.index({ actif: 1, role: 1 });

// Middleware pre-save pour hasher le mot de passe
utilisateurSchema.pre('save', async function (next) {
    if (!this.isModified('motDePasse')) return next();

    try {
        const sel = await bcrypt.genSalt(10);
        this.motDePasse = await bcrypt.hash(this.motDePasse, sel);
        this.majLe = new Date();
        next();
    } catch (erreur) {
        next(erreur);
    }
});

// Méthodes d'instance
utilisateurSchema.methods = {
    // Comparaison des mots de passe
    comparerMotDePasse: async function (motDePasse) {
        return await bcrypt.compare(motDePasse, this.motDePasse);
    },

    // Vérification des rôles
    estAdmin: function () {
        return this.role === 'ADMIN';
    },

    estTuteur: function () {
        return this.role === 'TUTEUR';
    },

    estEtudiant: function () {
        return this.role === 'ETUDIANT';
    },

    // Mise à jour de la dernière connexion
    mettreAJourDerniereConnexion: function () {
        this.derniereConnexion = new Date();
        this.tentativesConnexion = 0;
        return this.save();
    },

    // Gestion des tentatives de connexion
    incrementerTentativesConnexion: async function () {
        this.tentativesConnexion += 1;
        if (this.tentativesConnexion >= 5) {
            this.dateBlocage = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }
        return this.save();
    },

    // Vérification du blocage
    estBloque: function () {
        if (!this.dateBlocage) return false;
        return Date.now() < this.dateBlocage;
    },

    // Réinitialisation du blocage
    reinitialiserBlocage: function () {
        this.tentativesConnexion = 0;
        this.dateBlocage = null;
        return this.save();
    },
};

// Méthodes statiques
utilisateurSchema.statics = {
    // Recherche d'utilisateurs avec pagination
    rechercher: async function (criteres, options = {}) {
        const { page = 1, limite = 10, tri = '-creeLe', champs = '-motDePasse' } = options;

        const requete = this.find(criteres)
            .select(champs)
            .sort(tri)
            .skip((page - 1) * limite)
            .limit(limite);

        const [utilisateurs, total] = await Promise.all([
            requete.exec(),
            this.countDocuments(criteres),
        ]);

        return {
            utilisateurs,
            pagination: {
                page,
                limite,
                total,
                pages: Math.ceil(total / limite),
            },
        };
    },
};

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;
