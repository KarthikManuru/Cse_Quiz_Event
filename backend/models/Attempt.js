const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    chosenIndex: { type: Number, required: true },
    correctIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    studentId: { type: String, required: true, unique: true }, // Techzite ID
    email: { type: String, required: true },

    questionSet: { type: String, required: true }, // A / B / C / D

    // 🔹Each element contains question + options + chosen answer, etc.
    responses: [responseSchema],

    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },

    cheated: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["in-progress", "submitted"],
      default: "in-progress"
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },

    // ⏱️ Timing fields (server-defined to prevent manipulation)
    quizStartTime: { type: Date }, // Server timestamp when quiz started
    quizEndTime: { type: Date }, // Calculated: quizStartTime + totalQuizDuration
    perQuestionTimeLimit: { type: Number, default: 45 }, // 45 seconds per question
    totalQuizDuration: { type: Number, default: 900 }, // 15 minutes = 900 seconds
    questionDisplayTimes: [{ type: Date }], // Timestamps when each question was displayed
    currentQuestionIndex: { type: Number, default: 0 }, // Track current question for resume
    
    // ⏸️ Timer pause/resume state (for cheat detection)
    timerPaused: { type: Boolean, default: false }, // Whether timers are currently paused
    timerPausedAt: { type: Date }, // When timer was paused
    pausedQuestionTimeLeft: { type: Number }, // Remaining time for current question when paused
    pausedTotalTimeLeft: { type: Number }, // Remaining total time when paused
    pausedQuestionIndex: { type: Number }, // Which question was active when paused
    cheatDetectedAt: { type: Date }, // Timestamp when cheat was detected
    unlockedAt: { type: Date } // Timestamp when admin unlocked the quiz
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
