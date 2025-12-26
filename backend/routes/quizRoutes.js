const express = require("express");
const Attempt = require("../models/Attempt");
const questionSets = require("../data/questions"); // your question sets JSON

const router = express.Router();

// ---- Helpers ----
function getRandomSetKey() {
  const keys = Object.keys(questionSets);
  return keys[Math.floor(Math.random() * keys.length)];
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ---- START QUIZ (GROUP BASED) ----
router.post("/start", async (req, res) => {
  try {
    const { students } = req.body;

    // Validate 3 students
    if (!Array.isArray(students) || students.length !== 3) {
      return res.status(400).json({ message: "Exactly 3 students are required." });
    }

    for (const s of students) {
      if (!s.name || !s.studentId || !s.email || !s.phoneNumber) {
        return res.status(400).json({
          message: "Each student must have name, studentId, email, phoneNumber."
        });
      }
      if (!isValidEmail(s.email)) {
        return res.status(400).json({ message: `Invalid email for studentId ${s.studentId}` });
      }
    }

    // Prevent multiple attempts for same student
    const studentIds = students.map(s => s.studentId);
    const existingAttempt = await Attempt.findOne({ "students.studentId": { $in: studentIds } });
    if (existingAttempt) return res.status(400).json({ message: "One or more students already attempted quiz." });

    const setKey = getRandomSetKey();
    const perQuestionTimeLimit = 45;
    const totalQuizDuration = 900;
    const quizStartTime = new Date();
    const quizEndTime = new Date(quizStartTime.getTime() + totalQuizDuration * 1000);

    const attempt = await Attempt.create({
      students,
      questionSet: setKey,
      status: "in-progress",
      cheated: false,
      quizStartTime,
      quizEndTime,
      perQuestionTimeLimit,
      totalQuizDuration,
      questionDisplayTimes: []
    });

    // Send questions without revealing correct answers
    const questionsToSend = questionSets[setKey].map(({ correctIndex, ...rest }) => rest);

    res.json({
      attemptId: attempt._id,
      questionSet: setKey,
      questions: questionsToSend,
      quizStartTime: quizStartTime.toISOString(),
      quizEndTime: quizEndTime.toISOString(),
      perQuestionTimeLimit,
      totalQuizDuration
    });

  } catch (err) {
    console.error("Error in /start:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- SUBMIT QUIZ ----
router.post("/submit", async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    const questions = questionSets[attempt.questionSet];

    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({ message: "Invalid answers payload" });
    }

    const responses = answers.map((chosenIndex, i) => {
      const q = questions[i];
      return {
        question: q.question,
        options: q.options,
        chosenIndex,
        correctIndex: q.correctIndex,
        isCorrect: chosenIndex === q.correctIndex
      };
    });

    attempt.responses = responses;
    attempt.score = responses.filter(r => r.isCorrect).length;
    attempt.totalQuestions = responses.length;
    attempt.status = "submitted";
    attempt.endedAt = new Date();

    await attempt.save();

    res.json({
      message: "Quiz submitted successfully",
      score: attempt.score,
      totalQuestions: attempt.totalQuestions
    });

  } catch (err) {
    console.error("Error in /submit:", err);
    res.status(500).json({ message: "Failed to submit quiz" });
  }
});

// ---- FLAG CHEAT ----
router.post("/flag-cheat", async (req, res) => {
  try {
    const { attemptId, questionTimeLeft, totalTimeLeft, currentQuestionIndex } = req.body;
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    attempt.cheated = true;
    attempt.questionDisplayTimes.push({
      questionIndex: currentQuestionIndex,
      displayedAt: new Date(),
      timeLeft: questionTimeLeft
    });

    await attempt.save();
    res.json({ message: "Cheat flagged" });
  } catch (err) {
    console.error("Error in /flag-cheat:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- UNLOCK QUIZ (ADMIN ONLY) ----
router.post("/unlock", async (req, res) => {
  try {
    const { attemptId, adminCode } = req.body;
    if (adminCode !== "CSEADMIN2025") return res.status(403).json({ message: "Invalid admin code" });

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    attempt.cheated = false;
    await attempt.save();

    res.json({ message: "Quiz unlocked", pausedQuestionTimeLeft: 45 });
  } catch (err) {
    console.error("Error in /unlock:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- RESUME QUIZ ----
router.get("/resume/:attemptId", async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    const questionsToSend = questionSets[attempt.questionSet].map(({ correctIndex, ...rest }) => rest);

    res.json({
      attemptId: attempt._id,
      questionSet: attempt.questionSet,
      questions: questionsToSend,
      quizStartTime: attempt.quizStartTime,
      quizEndTime: attempt.quizEndTime,
      perQuestionTimeLimit: attempt.perQuestionTimeLimit,
      totalQuizDuration: attempt.totalQuizDuration,
      answers: attempt.responses || []
    });
  } catch (err) {
    console.error("Error in /resume:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- TRACK QUESTION ----
router.post("/track-question", async (req, res) => {
  try {
    const { attemptId, questionIndex } = req.body;
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    attempt.questionDisplayTimes.push({ questionIndex, displayedAt: new Date() });
    await attempt.save();

    res.json({ message: "Question tracked" });
  } catch (err) {
    console.error("Error in /track-question:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
