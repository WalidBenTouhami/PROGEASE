// src/models/QuizResult.js
const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    utilisateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'utilisateur', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    isPassed: { type: Boolean, required: true }, // Indique si l'utilisateur a reussi le quiz
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
