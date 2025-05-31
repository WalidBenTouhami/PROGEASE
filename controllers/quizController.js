const Quiz = require("../models/Quiz");
const quizSeed = require("../data/quizSeed");

exports.createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json({ message: "Quiz cree avec succès", quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur lors de la creation du quiz" });
  }
};

/*
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne().sort({ dateCreation: -1 });
    if (!quiz) return res.status(404).json({ error: "Quiz introuvable" });

    // on cache les reponses
    const questionsSansReponses = quiz.questions.map(q => ({
      question: q.question,
      options: q.options
    }));

    res.json({ titre: quiz.titre, description: quiz.description, questions: questionsSansReponses });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la recuperation du quiz" });
  }
};*/

exports.getQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) return res.status(404).json({ error: "Quiz introuvable" });

    const questionsSansReponses = quiz.questions.map(q => ({
      question: q.question,
      options: q.options
    }));

    res.json({
      titre: quiz.titre,
      description: quiz.description,
      questions: quiz.questions
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la recuperation du quiz" });
  }
};

exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({})
      .select('-questions.answer') // Exclude answers
      .sort({ dateCreation: -1 });

    if (!quizzes.length) {
      return res.status(404).json({ error: "No quizzes found" });
    }

    res.json({
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Server error",
      details: error.message 
    });
  }
};
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) return res.status(404).json({ error: "Quiz introuvable" });

    let score = 0;

    quiz.questions.forEach((q, index) => {
      const utilisateurAnswer = answers[index];
      if (
        typeof utilisateurAnswer === 'string' &&
        typeof q.answer === 'string' &&
        utilisateurAnswer.toLowerCase().trim() === q.answer.toLowerCase().trim()
      ) {
        score++;
      }
    });

    res.json({
      message: "Quiz terminé",
      note: `${score}/${quiz.questions.length}`,
      score
    });
  } catch (error) {
    console.error('Error during quiz submission:', error);
    res.status(500).json({ error: "Erreur lors de la soumission du quiz" });
  }
};
