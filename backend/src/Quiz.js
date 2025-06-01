const mongoose = require('mongoose'); 
const quizSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  questions: [{
    question: String,
    options: [String],
    answer: String
  }],
  dateCreation: { type: Date, default: Date.now } // Remove French accent
}, { collection: 'quizzes' }); // Explicit collection name
module.exports = mongoose.model('Quiz', quizSchema, 'quizzes');// Enregistrer et exporter le modèle
