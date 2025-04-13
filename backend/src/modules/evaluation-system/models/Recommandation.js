const mongoose = require('mongoose');

const recommandationSchema = new mongoose.Schema({
    etudiantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    ressources: [{
        titre: String,
        type: {
            type: String,
            enum: ['cours', 'exercice', 'projet', 'documentation']
        },
        url: String,
        priorite: {
            type: Number,
            min: 1,
            max: 5
        }
    }],
    domainesAmelioration: [String],
    dateCreation: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recommandation', recommandationSchema); 