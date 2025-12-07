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
    studentId: { type: String, required: true, unique: true },
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
    endedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
