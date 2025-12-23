const express = require("express");
const Attempt = require("../models/Attempt");

// ⚠️ IMPORTANT: Node.js caches require() modules until server restart
// If you update questions.js, you MUST restart the backend server
// for changes to take effect. See QUESTION_UPDATE_GUIDE.md for details.
const questionSets = require("../data/questions");

const router = express.Router();

function getRandomSetKey() {
  const keys = Object.keys(questionSets); // ['A', 'B', 'C', 'D']
  const index = Math.floor(Math.random() * keys.length);
  return keys[index];
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Start quiz: store student details + assign random set
router.post("/start", async (req, res) => {
  try {
    const { name, studentId, email } = req.body;

    // Validation: All fields required
    if (!name || !studentId || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validation: Email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    // Validation: Trim and check empty strings
    const trimmedName = name.trim();
    const trimmedStudentId = studentId.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedStudentId || !trimmedEmail) {
      return res.status(400).json({ message: "All fields must not be empty." });
    }

    // 🔒 One attempt per Techzite ID (studentId)
    // ⚠️ NOTE: If updating questions, use a NEW studentId that has never been used.
    // Reusing an existing studentId will be rejected here.
    const existing = await Attempt.findOne({ studentId: trimmedStudentId });
    if (existing) {
      return res.status(400).json({
        message: "This Techzite ID has already attempted the quiz."
      });
    }

    const setKey = getRandomSetKey();

    // ⏱️ Set timing fields (server-defined to prevent manipulation)
    const perQuestionTimeLimit = 45; // 45 seconds per question
    const totalQuizDuration = 900; // 15 minutes = 900 seconds
    const quizStartTime = new Date();
    const quizEndTime = new Date(quizStartTime.getTime() + totalQuizDuration * 1000);

    const attempt = await Attempt.create({
      name: trimmedName,
      studentId: trimmedStudentId,
      email: trimmedEmail,
      questionSet: setKey,
      status: "in-progress",
      cheated: false,
      quizStartTime,
      quizEndTime,
      perQuestionTimeLimit,
      totalQuizDuration,
      questionDisplayTimes: [] // Will be populated as questions are displayed
    });

    // Don't send correctIndex to frontend (security)
    const questionsToSend = questionSets[setKey].map(
      ({ correctIndex, ...rest }) => rest
    );

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
    // Handle duplicate key error (unique constraint on studentId)
    if (err.code === 11000) {
      return res.status(400).json({
        message: "This Techzite ID has already attempted the quiz."
      });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Resume quiz: Get quiz state and remaining time (for page refresh/reconnect)
router.get("/resume/:attemptId", async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found." });
    }

    if (attempt.status === "submitted") {
      return res.status(400).json({ message: "Quiz has already been submitted." });
    }

    // Calculate remaining time (use paused time if timer is paused)
    const now = new Date();
    let remainingTime;
    let pausedQuestionTimeLeft = null;
    let pausedTotalTimeLeft = null;

    if (attempt.timerPaused) {
      // Use paused timer values
      pausedTotalTimeLeft = attempt.pausedTotalTimeLeft || 0;
      pausedQuestionTimeLeft = attempt.pausedQuestionTimeLeft || attempt.perQuestionTimeLimit;
      remainingTime = pausedTotalTimeLeft;
    } else {
      // Calculate from quiz end time
      remainingTime = attempt.quizEndTime 
        ? Math.max(0, Math.floor((attempt.quizEndTime - now) / 1000))
        : attempt.totalQuizDuration;
    }

    // Get questions without correctIndex
    const setKey = attempt.questionSet;
    const questions = questionSets[setKey] || [];
    const questionsToSend = questions.map(({ correctIndex, ...rest }) => rest);

    res.json({
      attemptId: attempt._id,
      questionSet: setKey,
      questions: questionsToSend,
      quizStartTime: attempt.quizStartTime ? attempt.quizStartTime.toISOString() : null,
      quizEndTime: attempt.quizEndTime ? attempt.quizEndTime.toISOString() : null,
      perQuestionTimeLimit: attempt.perQuestionTimeLimit,
      totalQuizDuration: attempt.totalQuizDuration,
      remainingTime, // Remaining seconds
      questionDisplayTimes: attempt.questionDisplayTimes || [],
      timerPaused: attempt.timerPaused || false,
      pausedQuestionTimeLeft,
      pausedTotalTimeLeft,
      currentQuestionIndex: attempt.currentQuestionIndex || 0
    });
  } catch (err) {
    console.error("Error in /resume:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Track question display time
router.post("/track-question", async (req, res) => {
  try {
    const { attemptId, questionIndex } = req.body;

    if (typeof attemptId === "undefined" || typeof questionIndex !== "number") {
      return res.status(400).json({ message: "attemptId and questionIndex are required." });
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found." });
    }

    // Initialize questionDisplayTimes array if needed
    if (!attempt.questionDisplayTimes) {
      attempt.questionDisplayTimes = [];
    }

    // Store display time for this question index
    const displayTime = new Date();
    attempt.questionDisplayTimes[questionIndex] = displayTime;
    await attempt.save();

    res.json({ ok: true, displayTime: displayTime.toISOString() });
  } catch (err) {
    console.error("Error in /track-question:", err);
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

    if (attempt.status === "submitted") {
      return res.status(400).json({ message: "Quiz has already been submitted." });
    }

    // ⏱️ Validate timing on backend
    const now = new Date();
    if (now > attempt.quizEndTime) {
      // Quiz time has expired, but allow submission (auto-submit scenario)
      console.log(`Quiz ${attemptId} submitted after time limit`);
    }

    const setKey = attempt.questionSet;
    // ⚠️ NOTE: questionSets is loaded from require() at server startup.
    // If questions.js was updated, server must be restarted for changes to apply.
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

// Flag cheat: mark attempt as cheated and pause timers
router.post("/flag-cheat", async (req, res) => {
  try {
    const { attemptId, questionTimeLeft, totalTimeLeft, currentQuestionIndex } = req.body;

    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required." });
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found." });
    }

    if (attempt.status === "submitted") {
      return res.status(400).json({ message: "Quiz has already been submitted." });
    }

    // Store timer state when cheat is detected
    const now = new Date();
    const updateData = {
      cheated: true,
      timerPaused: true,
      timerPausedAt: now,
      cheatDetectedAt: now,
      pausedQuestionTimeLeft: typeof questionTimeLeft === "number" ? questionTimeLeft : attempt.perQuestionTimeLimit,
      pausedTotalTimeLeft: typeof totalTimeLeft === "number" ? totalTimeLeft : (attempt.quizEndTime ? Math.max(0, Math.floor((attempt.quizEndTime - now) / 1000)) : attempt.totalQuizDuration),
      pausedQuestionIndex: typeof currentQuestionIndex === "number" ? currentQuestionIndex : attempt.currentQuestionIndex,
      currentQuestionIndex: typeof currentQuestionIndex === "number" ? currentQuestionIndex : attempt.currentQuestionIndex
    };

    await Attempt.findByIdAndUpdate(attemptId, updateData);
    res.json({ ok: true, message: "Cheat flagged and timers paused." });
  } catch (err) {
    console.error("Error in /flag-cheat:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Unlock quiz: resume timers after admin unlock
router.post("/unlock", async (req, res) => {
  try {
    const { attemptId, adminCode } = req.body;

    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required." });
    }

    // In production, validate adminCode against environment variable or database
    // For now, we'll accept any unlock request (admin validation should be done client-side or via separate auth)
    
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found." });
    }

    if (attempt.status === "submitted") {
      return res.status(400).json({ message: "Quiz has already been submitted." });
    }

    if (!attempt.timerPaused) {
      return res.status(400).json({ message: "Quiz is not paused." });
    }

    // Calculate new quiz end time based on paused total time
    const now = new Date();
    const remainingTotalTime = attempt.pausedTotalTimeLeft || 0;
    const newQuizEndTime = new Date(now.getTime() + remainingTotalTime * 1000);

    // Resume timers
    const updateData = {
      timerPaused: false,
      unlockedAt: now,
      quizEndTime: newQuizEndTime, // Extend end time to account for paused duration
      currentQuestionIndex: attempt.pausedQuestionIndex !== undefined ? attempt.pausedQuestionIndex : attempt.currentQuestionIndex
    };

    await Attempt.findByIdAndUpdate(attemptId, updateData);

    res.json({
      ok: true,
      message: "Quiz unlocked and timers resumed.",
      pausedQuestionTimeLeft: attempt.pausedQuestionTimeLeft,
      pausedTotalTimeLeft: remainingTotalTime,
      newQuizEndTime: newQuizEndTime.toISOString(),
      currentQuestionIndex: updateData.currentQuestionIndex
    });
  } catch (err) {
    console.error("Error in /unlock:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
