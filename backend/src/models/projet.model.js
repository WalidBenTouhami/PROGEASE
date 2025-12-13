const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Enums } = require('../../config/constants');

const projetSchema = new Schema(
    {
        titre: {
            type: String,
            required: [true, 'Le titre du projet est requis.'],
            trim: true,
            minlength: [5, 'Le titre doit contenir au moins 5 caracteres.'],
            maxlength: [200, 'Le titre ne peut pas depasser 200 caracteres.'],
        },
        description: {
            type: String,
            required: [true, 'La description du projet est requise.'],
            trim: true,
            minlength: [10, 'La description doit contenir au moins 10 caracteres.'],
        },
        equipe: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Utilisateur',
                validate: {
                    validator: function (v) {
                        return mongoose.Types.ObjectId.isValid(v);
                    },
                    message: props => `${props.value} n'est pas un ID utilisateur valide!`,
                },
            },
        ],
        tuteur: {
            type: Schema.Types.ObjectId,
            ref: 'Utilisateur',
            validate: {
                validator: function (v) {
                    return v === null || mongoose.Types.ObjectId.isValid(v);
                },
                message: props => `${props.value} n'est pas un ID tuteur valide!`,
            },
        },
        competences: {
            type: [String],
            validate: {
                validator: function (arr) {
                    return Array.isArray(arr) && arr.length > 0;
                },
                message: 'Le projet doit comporter au moins une competence.',
            },
        },
        dateDebut: {
            type: Date,
            required: [true, 'La date de debut est requise.'],
            validate: {
                validator: function (v) {
                    return v instanceof Date && !isNaN(v);
                },
                message: 'Format de date de debut invalide.',
            },
        },
        dateFin: {
            type: Date,
            required: [true, 'La date de fin est requise.'],
            validate: [
                {
                    validator: function (value) {
                        return value > this.dateDebut;
                    },
                    message: 'La date de fin doit etre posterieure à la date de debut.',
                },
                {
                    validator: function (v) {
                        return v instanceof Date && !isNaN(v);
                    },
                    message: 'Format de date de fin invalide.',
                },
            ],
        },
        livrables: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Livrable',
                validate: {
                    validator: function (v) {
                        return mongoose.Types.ObjectId.isValid(v);
                    },
                    message: props => `${props.value} n'est pas un ID livrable valide!`,
                },
            },
        ],
        statut: {
            type: String,
            required: true,
            enum: {
                values: Object.values(Enums.StatutProjet),
                message: 'Statut de projet invalide',
            },
            default: Enums.StatutProjet.BROUILLON,
        },
        urlDepot: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    const urlPattern =
                        /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(\.[a-zA-Z]{2,6})(\/[^\s]*)?$/;
                    return !v || urlPattern.test(v);
                },
                message: props => `${props.value} n'est pas une URL valide!`,
            },
        },
        progression: {
            type: Number,
            min: [0, 'La progression ne peut pas etre negative.'],
            max: [100, 'La progression ne peut pas depasser 100%.'],
            default: 0,
            get: v => Math.round(v),
            set: v => Math.round(v),
        },
        creeLe: {
            type: Date,
            default: Date.now,
        },
        majLe: {
            type: Date,
            default: Date.now,
        },
        theme: {
            type: String,
            required: [true, 'Le thème du projet est requis.'],
            trim: true,
        },
        categories: [
            {
                type: String,
                required: true,
                trim: true,
            },
        ],
        taches: [
            {
                titre: {
                    type: String,
                    required: true,
                    trim: true,
                },
                description: {
                    type: String,
                    required: true,
                    trim: true,
                },
                dateDebut: {
                    type: Date,
                    required: true,
                },
                dateFin: {
                    type: Date,
                    required: true,
                },
                statut: {
                    type: String,
                    enum: ['A_FAIRE', 'EN_COURS', 'TERMINEE', 'BLOQUEE'],
                    default: 'A_FAIRE',
                },
                progression: {
                    type: Number,
                    min: 0,
                    max: 100,
                    default: 0,
                },
                assigneA: {
                    type: Schema.Types.ObjectId,
                    ref: 'Utilisateur',
                },
            },
        ],
        signalements: [
            {
                type: {
                    type: String,
                    required: true,
                    enum: ['BLOQUE', 'URGENT', 'RETARD', 'AUTRE'],
                },
                description: {
                    type: String,
                    required: true,
                    trim: true,
                },
                priorite: {
                    type: String,
                    enum: ['BASSE', 'MOYENNE', 'HAUTE', 'URGENTE'],
                    default: 'MOYENNE',
                },
                tacheId: {
                    type: Schema.Types.ObjectId,
                },
                signalePar: {
                    type: Schema.Types.ObjectId,
                    ref: 'Utilisateur',
                },
                dateSignalement: {
                    type: Date,
                    default: Date.now,
                },
                statut: {
                    type: String,
                    enum: ['OUVERT', 'EN_COURS', 'RESOLU', 'FERME'],
                    default: 'OUVERT',
                },
                resolution: {
                    type: String,
                    trim: true,
                },
                dateResolution: {
                    type: Date,
                },
            },
        ],
    },
    {
        toJSON: { virtuals: true, getters: true },
        toObject: { virtuals: true, getters: true },
    }
);

// Virtuals
projetSchema.virtual('duree').get(function () {
    return Math.ceil((this.dateFin - this.dateDebut) / (1000 * 60 * 60 * 24));
});

projetSchema.virtual('estEnRetard').get(function () {
    return (
        this.statut !== Enums.StatutProjet.TERMINE &&
        this.statut !== Enums.StatutProjet.ARCHIVE &&
        new Date() > this.dateFin
    );
});

// Populer les livrables virtuels
projetSchema.virtual('livrablesComplets', {
    ref: 'Livrable',
    localField: '_id',
    foreignField: 'projetId',
});

// Index optimises
projetSchema.index({ titre: 1 });
projetSchema.index({ statut: 1 });
projetSchema.index({ creeLe: -1 });
projetSchema.index({ statut: 1, creeLe: -1 });
projetSchema.index({ equipe: 1 });
projetSchema.index({ tuteur: 1 });
projetSchema.index({ dateDebut: 1, dateFin: 1 });

// Middleware pre-sauvegarde
projetSchema.pre('save', async function (next) {
    this.majLe = new Date();

    // Mise à jour automatique du statut en fonction des dates
    if (this.statut !== Enums.StatutProjet.ARCHIVE) {
        const maintenant = new Date();
        if (this.progression >= 100 && this.statut !== Enums.StatutProjet.TERMINE) {
            this.statut = Enums.StatutProjet.TERMINE;
        } else if (maintenant > this.dateFin && this.statut !== Enums.StatutProjet.TERMINE) {
            this.statut = Enums.StatutProjet.EN_RETARD;
        } else if (maintenant >= this.dateDebut && maintenant <= this.dateFin) {
            if (
                this.statut === Enums.StatutProjet.BROUILLON ||
                this.statut === Enums.StatutProjet.A_VENIR
            ) {
                this.statut = Enums.StatutProjet.EN_COURS;
            }
        } else if (maintenant < this.dateDebut && this.statut === Enums.StatutProjet.BROUILLON) {
            this.statut = Enums.StatutProjet.A_VENIR;
        }
    }

    // Auto-calcul de progression si livrables presents
    if (this.isModified('livrables') && this.livrables.length > 0) {
        await this.calculerProgression();
    }

    next();
});

// Middlewares "pre-mise" à jour
projetSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
    this.set({ majLe: new Date() });
    next();
});

// Methode pour calculer la progression
projetSchema.methods.calculerProgression = async function () {
    const livrable = mongoose.model('Livrable');
    const livrables = await livrable.find({ _id: { $in: this.livrables } }).lean();

    if (!livrables.length) {
        this.progression = 0;
        return;
    }

    const termines = livrables.filter(l => l.statut === Enums.StatutLivrable.TERMINE).length;
    this.progression = Math.round((termines / livrables.length) * 100);
};

// Methode statique pour recherche avancee
projetSchema.statics.rechercheAvancee = async function (criteres = {}) {
    const { titre, statut, competences, dateDebut, dateFin, page = 1, limit = 20 } = criteres;

    const query = {};

    if (titre) query.titre = new RegExp(titre, 'i');
    if (statut) query.statut = statut;
    if (competences && competences.length) query.competences = { $all: competences };

    if (dateDebut || dateFin) {
        query.dateDebut = {};
        if (dateDebut) query.dateDebut.$gte = new Date(dateDebut);
        if (dateFin) query.dateDebut.$lte = new Date(dateFin);
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { creeLe: -1 },
        lean: true,
    };

    return this.find(query)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .sort(options.sort)
        .lean();
};

// Méthode pour calculer les statistiques du projet
projetSchema.methods.calculerStatistiques = function () {
    const stats = {
        totalTaches: this.taches.length,
        tachesTerminees: this.taches.filter(t => t.statut === 'TERMINEE').length,
        tachesEnCours: this.taches.filter(t => t.statut === 'EN_COURS').length,
        tachesBloquees: this.taches.filter(t => t.statut === 'BLOQUEE').length,
        signalementsOuverts: this.signalements.filter(s => s.statut === 'OUVERT').length,
        signalementsUrgents: this.signalements.filter(s => s.priorite === 'URGENTE').length,
    };

    stats.progressionMoyenne =
        this.taches.length > 0
            ? Math.round(
                this.taches.reduce((acc, t) => acc + t.progression, 0) / this.taches.length
            )
            : 0;

    return stats;
};

module.exports = mongoose.model('Projet', projetSchema);
