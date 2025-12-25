const mongoose = require("mongoose");

/* 🔹 Individual Question Response */
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


/* 🔹 Student Schema */
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    studentId: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true }
  },
  { _id: false }
);

/* 🔹 Attempt Schema */
const attemptSchema = new mongoose.Schema(
  {
    students: {
      type: [studentSchema],
      validate: {
        validator: (arr) => arr.length === 3,
        message: "Exactly 3 students must be present."
      },
      required: true
    },
    questionSet: { type: String, required: true },
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
    quizStartTime: { type: Date },
    quizEndTime: { type: Date },
    perQuestionTimeLimit: { type: Number, default: 45 },
    totalQuizDuration: { type: Number, default: 900 },
    questionDisplayTimes: [{ questionIndex: Number, displayedAt: Date, timeLeft: Number }],
    currentQuestionIndex: { type: Number, default: 0 },
    timerPaused: { type: Boolean, default: false },
    timerPausedAt: { type: Date },
    pausedQuestionTimeLeft: { type: Number },
    pausedTotalTimeLeft: { type: Number },
    pausedQuestionIndex: { type: Number },
    cheatDetectedAt: { type: Date },
    unlockedAt: { type: Date },
    mode: {
      type: String,
      enum: ["online", "offline"],
      default: "offline"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
