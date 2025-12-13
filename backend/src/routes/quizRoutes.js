const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.post('/create', quizController.createQuiz); // seed une fois
router.get('/quizzes/:id', quizController.getQuiz);
router.get('/quizzes', quizController.getAllQuizzes); // New endpoint
router.post('/submit', quizController.submitQuiz);

module.exports = router;
