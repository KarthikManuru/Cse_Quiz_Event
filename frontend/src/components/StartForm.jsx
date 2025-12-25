import React, { useState } from "react";
import { startQuiz } from "../api";

const StartForm = ({ onStarted }) => {
  const [students, setStudents] = useState([
    { name: "", studentId: "", email: "", phoneNumber: "" },
    { name: "", studentId: "", email: "", phoneNumber: "" },
    { name: "", studentId: "", email: "", phoneNumber: "" }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleStudentChange = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate students
    for (let i = 0; i < students.length; i++) {
      const s = students[i];

      if (!s.name || !s.studentId || !s.email || !s.phoneNumber) {
        setError(`Please fill all fields for Student ${i + 1}.`);
        return;
      }

      if (!isValidEmail(s.email.trim())) {
        setError(`Invalid email for Student ${i + 1}.`);
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        students: students.map((s) => ({
          name: s.name.trim(),
          studentId: s.studentId.trim(),
          email: s.email.trim(),
          phoneNumber: s.phoneNumber.trim()
        }))
      };

      const data = await startQuiz(payload);
      onStarted(data);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to start quiz.");
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
            Enter details of all 3 students
          </div>
        </div>
        <span className="badge">TECKZITE'25 2.0</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Students */}
        {students.map((student, index) => (
          <div key={index} className="group-box">
            <h4>Student {index + 1}</h4>

            <div className="input-group">
              <label>Name</label>
              <input
                placeholder="Full Name"
                value={student.name}
                onChange={(e) =>
                  handleStudentChange(index, "name", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Teckzite ID</label>
              <input
                placeholder="RGUKTxxxx"
                value={student.studentId}
                onChange={(e) =>
                  handleStudentChange(index, "studentId", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Email ID</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={student.email}
                onChange={(e) =>
                  handleStudentChange(index, "email", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                placeholder="10-digit mobile number"
                value={student.phoneNumber}
                onChange={(e) =>
                  handleStudentChange(index, "phoneNumber", e.target.value)
                }
              />
            </div>
          </div>
        ))}

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Starting Quiz..." : "Start Quiz"}
        </button>

        <p className="text-muted" style={{ marginTop: 12 }}>
          <strong>Instructions:</strong><br />
          • One group → one submission.<br />
          • Do not switch tabs.<br />
          • Copy-paste & right-click are prohibited.<br />
          • Any violation will be treated as cheating.<br />
          • Total quiz duration: 15 minutes.<br />
          • Each question: 45 seconds.<br />
          • Questions auto-submit on timeout.
        </p>
      </form>
    </div>
  );
};

export default StartForm;
