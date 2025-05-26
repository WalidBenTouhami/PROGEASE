// models/livrable.model.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const livrableSchema = new Schema({
    intitule: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 150
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    dateLimite: {
        type: Date,
        required: true
    },
    projetId: {
        type: Schema.Types.ObjectId,
        ref: 'Projet',
        required: true
    },
    statut: {
        type: String,
        enum: ['en_attente', 'en_retard', 'termine'],
        default: 'en_attente'
    }
}, {
    timestamps: true // ajoute automatiquement createdAt et updatedAt
});

module.exports = model('Livrable', livrableSchema);
