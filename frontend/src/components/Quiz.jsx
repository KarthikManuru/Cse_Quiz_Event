import React, { useEffect, useState } from "react";
import { submitQuiz, flagCheat } from "../api";

// 🔑 SET YOUR ADMIN CODE HERE
const ADMIN_RESET_CODE = "CSEADMIN2025";

const Quiz = ({ attemptId, questionSet, questions, onFinished }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(
    Array(questions.length).fill(null)
  );
  const [submitting, setSubmitting] = useState(false);

  const [cheatDetected, setCheatDetected] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [canCloseOverlay, setCanCloseOverlay] = useState(false); // 👈 show X after valid code

  // ⏱️ 10 minutes = 600 seconds
  const [timeLeft, setTimeLeft] = useState(600);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // ---- ANTI-CHEAT ----
  const markCheat = async () => {
    if (!cheatDetected) {
      console.log("Cheat detected -> overlay ON");
      setCheatDetected(true);
      try {
        await flagCheat(attemptId);
      } catch (e) {
        console.error("Failed to flag cheat:", e);
      }
    }
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        markCheat();
      }
    };

    const handleBlur = () => {
      markCheat();
    };

    const handleKeyDown = (e) => {
      if (
        e.ctrlKey &&
        (e.key === "c" ||
          e.key === "C" ||
          e.key === "v" ||
          e.key === "V")
      ) {
        e.preventDefault();
        markCheat();
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      markCheat();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cheatDetected, attemptId]);

  // ---- TIMER ----
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !hasSubmitted) {
      handleSubmitQuiz(true); // auto submit
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, hasSubmitted]);

  const handleOptionClick = (optionIndex) => {
    if (cheatDetected || hasSubmitted || timeLeft === 0) return;
    setAnswers((prev) => {
      const newArr = [...prev];
      newArr[currentIndex] = optionIndex;
      return newArr;
    });
  };

  const handleSubmitQuiz = async (auto = false) => {
    if (hasSubmitted) return;

    if (!auto && answers.some((ans) => ans === null)) {
      const ok = window.confirm(
        "Some questions are unanswered. Do you still want to submit?"
      );
      if (!ok) return;
    }

    try {
      setSubmitting(true);
      setHasSubmitted(true);

      const payload = {
        attemptId,
        answers
      };

      const result = await submitQuiz(payload);
      onFinished(result); // {score, total}
    } catch (err) {
      console.error(err);
      if (!auto) {
        alert("Failed to submit quiz. Please contact the invigilator.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeText =
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0");

  const currQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isTimeUp = timeLeft === 0 || hasSubmitted;

  // ---- ADMIN UNLOCK ----
  const handleAdminReset = () => {
    const typed = adminCodeInput.trim();
    console.log("Admin trying to unlock with:", typed);

    if (typed === ADMIN_RESET_CODE) {
      setAdminError("");
      setCanCloseOverlay(true);   // ✅ NOW show X button
    } else {
      setAdminError("Invalid admin reset code.");
      setCanCloseOverlay(false);
    }
  };

  const handleCloseOverlay = () => {
    // Only close if admin already entered correct code
    if (!canCloseOverlay) {
      setAdminError("Enter valid admin reset code before closing.");
      return;
    }
    console.log("Closing cheat overlay after valid code");
    setCheatDetected(false);
    setAdminCodeInput("");
    setCanCloseOverlay(false);
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Quiz - Set {questionSet}</div>
            <div className="card-subtitle">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="badge">⏱ Time Left: {timeText}</div>
            <div className="text-muted" style={{ marginTop: 4, fontSize: 11 }}>
              Total duration: 10 minutes
            </div>
          </div>
        </div>

        <div className="progress-bar">
          <div
            className="progress-inner"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="quiz-question">{currQ.question}</div>

        <div className="options-grid">
          {currQ.options.map((opt, idx) => (
            <button
              type="button"
              key={idx}
              className={
                "option-btn" +
                (answers[currentIndex] === idx ? " selected" : "")
              }
              onClick={() => handleOptionClick(idx)}
              disabled={isTimeUp || cheatDetected}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="quiz-footer">
          <div>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((i) => (i > 0 ? i - 1 : i))
              }
              disabled={currentIndex === 0 || submitting || isTimeUp}
            >
              Previous
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((i) =>
                    i < questions.length - 1 ? i + 1 : i
                  )
                }
                disabled={submitting || isTimeUp}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmitQuiz(false)}
                disabled={submitting || isTimeUp}
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>

        <p className="text-muted" style={{ marginTop: 10 }}>
          Do not switch tabs or use copy-paste. Cheating is recorded in the
          system. Once time is over, the quiz will auto-submit.
        </p>
      </div>

      {cheatDetected && (
        <div className="cheat-overlay">
          <div className="cheat-panel">
            {/* Header with title + X */}
            <div className="cheat-panel-header">
              <div className="cheat-title">Cheating Detected</div>

              {/* ❌ X appears only AFTER correct code */}
              {canCloseOverlay && (
                <button
                  type="button"
                  className="cheat-close-btn"
                  onClick={handleCloseOverlay}
                >
                  ×
                </button>
              )}
            </div>

            <div className="cheat-text">
              You have switched tabs or tried restricted actions.
              <br />
              Your quiz is locked. Please call the invigilator/admin.
            </div>

            <div className="input-group" style={{ marginTop: 12 }}>
              <label>Admin Reset Code</label>
              <input
                type="password"
                placeholder="Enter invigilator code"
                value={adminCodeInput}
                onChange={(e) => setAdminCodeInput(e.target.value)}
              />
            </div>
            {adminError && <div className="error">{adminError}</div>}

            <button type="button" onClick={handleAdminReset}>
              Unlock Quiz (Admin Only)
            </button>

            <p className="small-hint" style={{ marginTop: 10 }}>
              After entering the correct code and clicking <b>Unlock Quiz</b>,
              an <b>X</b> will appear at the top-right. Click that X to close
              this screen and resume the exam. The cheating flag still remains
              stored in the database.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Quiz;
