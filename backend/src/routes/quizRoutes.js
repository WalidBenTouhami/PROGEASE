const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const { rateLimiter } = require("../middlewares/rateLimiter");

router.post("/create", rateLimiter({ windowMs: 60000, max: 20 }), quizController.createQuiz); // seed une fois
router.get("/quizzes/:id", rateLimiter({ windowMs: 60000, max: 50 }), quizController.getQuiz);
router.get("/quizzes", rateLimiter({ windowMs: 60000, max: 50 }), quizController.getAllQuizzes); // New endpoint
router.post("/submit", rateLimiter({ windowMs: 60000, max: 30 }), quizController.submitQuiz);

module.exports = router;
