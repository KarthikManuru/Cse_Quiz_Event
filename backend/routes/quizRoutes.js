const express = require("express");
const Attempt = require("../models/Attempt");
const questionSets = require("../data/questions");

const router = express.Router();

function getRandomSetKey() {
  const keys = Object.keys(questionSets); // ['A', 'B', 'C', 'D']
  const index = Math.floor(Math.random() * keys.length);
  return keys[index];
}

// Start quiz: store student details + assign random set
router.post("/start", async (req, res) => {
  try {
    const { name, studentId, email } = req.body;

    if (!name || !studentId || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 🔒 One attempt per studentId
    const existing = await Attempt.findOne({ studentId });
    if (existing) {
      return res.status(400).json({
        message: "This ID has already attempted the quiz."
      });
    }

    const setKey = getRandomSetKey();

    const attempt = await Attempt.create({
      name,
      studentId,
      email,
      questionSet: setKey,
      status: "in-progress",
      cheated: false
    });

    // Don't send correctIndex to frontend (security)
    const questionsToSend = questionSets[setKey].map(
      ({ correctIndex, ...rest }) => rest
    );

    res.json({
      attemptId: attempt._id,
      questionSet: setKey,
      questions: questionsToSend
    });
  } catch (err) {
    console.error("Error in /start:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit quiz: compute score, store responses with question + answer + correctness
router.post("/submit", async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    if (!attemptId || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ message: "attemptId and answers are required." });
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found." });
    }

    const setKey = attempt.questionSet;
    const questions = questionSets[setKey];

    if (!questions || questions.length === 0) {
      return res.status(500).json({ message: "Question set not found." });
    }

    let score = 0;
    const responses = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const chosenIndex = answers[i]; // may be undefined/null if not answered
      const correctIndex = q.correctIndex;

      const isCorrect = chosenIndex === correctIndex;
      if (isCorrect) score++;

      responses.push({
        question: q.question,
        options: q.options,
        chosenIndex:
          typeof chosenIndex === "number" ? chosenIndex : -1, // -1 = not answered
        correctIndex,
        isCorrect
      });
    }

    attempt.responses = responses;
    attempt.score = score;
    attempt.totalQuestions = questions.length;
    attempt.status = "submitted";
    attempt.endedAt = new Date();
    await attempt.save();

    res.json({ score, total: questions.length });
  } catch (err) {
    console.error("Error in /submit:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Flag cheat: mark attempt as cheated
router.post("/flag-cheat", async (req, res) => {
  try {
    const { attemptId } = req.body;

    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required." });
    }

    await Attempt.findByIdAndUpdate(attemptId, { cheated: true });
    res.json({ ok: true });
  } catch (err) {
    console.error("Error in /flag-cheat:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
