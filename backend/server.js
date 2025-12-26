const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const quizRoutes = require("./routes/quizRoutes");

dotenv.config();

const app = express();

// ✅ Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("CSE Event Quiz Backend is running 🚀");
});

// Use quiz routes
app.use("/quiz", quizRoutes); // frontend is calling API_BASE_URL + /quiz/start

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
