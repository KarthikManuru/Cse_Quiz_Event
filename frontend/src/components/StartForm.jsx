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

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation: All fields required
    if (!form.name || !form.studentId || !form.email) {
      setError("Please fill all fields.");
      return;
    }

    // Validation: Trim and check empty strings
    const trimmedName = form.name.trim();
    const trimmedStudentId = form.studentId.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName || !trimmedStudentId || !trimmedEmail) {
      setError("All fields must not be empty.");
      return;
    }

    // Validation: Email format
    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const data = await startQuiz({
        name: trimmedName,
        studentId: trimmedStudentId,
        email: trimmedEmail
      });
      onStarted(data); // {attemptId, questionSet, questions, timing info}
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
            Enter your details to Start the Quiz.
          </div>
        </div>
        <span className="badge">TECKZITE'25 2.0</span>
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
          <label>Teckzite ID</label>
          <input
            name="studentId"
            placeholder="Your Teckzite ID"
            value={form.studentId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Email ID</label>
          <input
            name="email"
            type="email"
            placeholder="your.email@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Starting..." : "Start Quiz"}
        </button>

        <p className="text-muted" style={{ marginTop: 10 }}>
  <strong>Instructions:</strong><br />
  • Do not switch tabs.<br />
  • Copy-paste actions (Ctrl+C / Ctrl+V) are not allowed.<br />
  • Right-clicking is strictly prohibited.<br />
  • Any prohibited action will be treated as cheating.<br />
  • Each Teckzite ID is allowed only one attempt.<br />
  • Total quiz duration is 15 minutes.<br />
  • Each question has a fixed time limit of 45 seconds.<br />
  • Questions will move automatically after the time expires.<br />
  • Previous questions cannot be revisited.<br />
  • The quiz will be submitted automatically once the total time ends.
</p>

      </form>
    </div>
  );
};

export default StartForm;