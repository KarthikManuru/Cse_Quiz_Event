import React, { useState } from "react";
import { startQuiz } from "../api";

const StartForm = ({ onStarted }) => {
  const [form, setForm] = useState({
    name: "",
    studentId: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.studentId || !form.email) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      const data = await startQuiz(form);
      onStarted(data); // {attemptId, questionSet, questions}
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to start quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">CSE Department Quiz</div>
          <div className="card-subtitle">
            Enter your details to begin the test.
          </div>
        </div>
        <span className="badge">TechFest 2025</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Name</label>
          <input
            name="name"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Student ID</label>
          <input
            name="studentId"
            placeholder="Roll / ID number"
            value={form.studentId}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Institute Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@college.edu"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Starting..." : "Start Quiz"}
        </button>

        <p className="text-muted" style={{ marginTop: 10 }}>
          Note: Do not switch tabs or copy-paste. Any such action will be
          treated as cheating. Each ID can attempt the quiz only once.
        </p>
      </form>
    </div>
  );
};

export default StartForm;
