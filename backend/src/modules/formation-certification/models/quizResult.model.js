import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Utilisateur",
    required: true
  },
  formationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Formation",
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  scoreMinimum: {
    type: Number,
    required: true
  },
  datePassage: {
    type: Date,
    default: Date.now
  }
});

const QuizResult = mongoose.model("QuizResult", quizResultSchema);
export default QuizResult;