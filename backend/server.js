const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const quizRoutes = require("./routes/quizRoutes");

dotenv.config();

const app = express();
app.use(cors({ origin: "*" })); 
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CSE Event Quiz Backend is running 🚀");
});

app.use("/api/quiz", quizRoutes);

const PORT = process.env.PORT || 5000;

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
