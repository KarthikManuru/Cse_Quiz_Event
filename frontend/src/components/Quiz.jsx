import React, { useEffect, useState, useRef, useCallback } from "react";
import { submitQuiz, flagCheat, trackQuestion, unlockQuiz } from "../api";

// 🔑 SET YOUR ADMIN CODE HERE
const ADMIN_RESET_CODE = "CSEADMIN2025";

const Quiz = ({ 
  attemptId, 
  questionSet, 
  questions, 
  onFinished,
  quizStartTime,
  quizEndTime,
  perQuestionTimeLimit = 45,
  totalQuizDuration = 900,
  timerPaused = false,
  pausedTotalTimeLeft,
  pausedQuestionTimeLeft,
  currentQuestionIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(currentQuestionIndex);
  const [answers, setAnswers] = useState(
    Array(questions.length).fill(null)
  );
  const [submitting, setSubmitting] = useState(false);

  const [cheatDetected, setCheatDetected] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [canCloseOverlay, setCanCloseOverlay] = useState(false);

  // ⏱️ Timing state
  const [totalTimeLeft, setTotalTimeLeft] = useState(
    pausedTotalTimeLeft !== undefined ? pausedTotalTimeLeft : totalQuizDuration
  ); // Total remaining time in seconds
  const [questionTimeLeft, setQuestionTimeLeft] = useState(
    pausedQuestionTimeLeft !== undefined ? pausedQuestionTimeLeft : perQuestionTimeLimit
  ); // Per-question time in seconds
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Refs to track intervals
  const totalTimerRef = useRef(null);
  const questionTimerRef = useRef(null);
  const questionDisplayTrackedRef = useRef(new Set()); // Track which questions we've sent display time for
  const timersPausedRef = useRef(timerPaused || false); // Track if timers are paused
  const lastQuestionIndexRef = useRef(currentQuestionIndex);
  const unlockResultRef = useRef(null);
  const unlockAllowedRef = useRef(false);

  // ---- ANTI-CHEAT ----
  const markCheat = useCallback(async () => {
    if (!cheatDetected && !timersPausedRef.current) {
      console.log("Cheat detected -> overlay ON, pausing timers");
      
      // Pause timers immediately
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
        totalTimerRef.current = null;
      }
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
        questionTimerRef.current = null;
      }
      timersPausedRef.current = true;
      
      setCheatDetected(true);
      try {
        // Send current timer state to backend
        await flagCheat(attemptId, questionTimeLeft, totalTimeLeft, currentIndex);
      } catch (e) {
        console.error("Failed to flag cheat:", e);
      }
    }
  }, [cheatDetected, attemptId, questionTimeLeft, totalTimeLeft, currentIndex]);

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

  // Handle quiz submission
  const handleSubmitQuiz = useCallback(async (auto = false) => {
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
  }, [attemptId, answers, hasSubmitted, onFinished]);

  // ⏱️ Total quiz timer (15 minutes / 900 seconds) - runs in parallel with question timer
  // This timer always counts down locally so it stays exactly 15:00 at the start.
  useEffect(() => {
    if (timersPausedRef.current || cheatDetected || hasSubmitted) return;

    if (totalTimerRef.current) {
      clearInterval(totalTimerRef.current);
      totalTimerRef.current = null;
    }

    totalTimerRef.current = setInterval(() => {
      if (timersPausedRef.current) return;
      setTotalTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0 && !hasSubmitted) {
          handleSubmitQuiz(true);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
        totalTimerRef.current = null;
      }
    };
  }, [cheatDetected, hasSubmitted, handleSubmitQuiz]);

  // Move handleQuestionTimeout before the useEffect that uses it
  const handleQuestionTimeout = useCallback(() => {
    if (hasSubmitted || cheatDetected) return;
    
    // Move to next question if available
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Last question - auto-submit
      handleSubmitQuiz(true);
    }
  }, [currentIndex, hasSubmitted, cheatDetected, questions.length, handleSubmitQuiz]);

  // ⏱️ Per-question timer (45 seconds)
  useEffect(() => {
    // Don't start timer if paused
    if (timersPausedRef.current || cheatDetected) return;

    // Ensure there is only one running interval
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }

    // Reset question timer ONLY when the question actually changes.
    // This prevents losing remaining time when the quiz gets unlocked after cheating.
    if (lastQuestionIndexRef.current !== currentIndex) {
      setQuestionTimeLeft(perQuestionTimeLimit);
      lastQuestionIndexRef.current = currentIndex;
    }
    
    // Track question display time (only once per question)
    if (attemptId && !questionDisplayTrackedRef.current.has(currentIndex)) {
      trackQuestion(attemptId, currentIndex);
      questionDisplayTrackedRef.current.add(currentIndex);
    }
    
    // Start countdown for current question
    questionTimerRef.current = setInterval(() => {
      // Don't update if paused
      if (timersPausedRef.current) return;
      
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          // Question time expired - auto-advance
          handleQuestionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
  }, [currentIndex, perQuestionTimeLimit, attemptId, cheatDetected, handleQuestionTimeout]);

  const handleOptionClick = useCallback((optionIndex) => {
    if (cheatDetected || hasSubmitted || totalTimeLeft === 0 || questionTimeLeft === 0) return;
    
    setAnswers(prev => {
      const newArr = [...prev];
      newArr[currentIndex] = optionIndex;
      return newArr;
    });
  }, [cheatDetected, hasSubmitted, totalTimeLeft, questionTimeLeft, currentIndex]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatQuestion = (text) => {
    if (!text) return "";

    // Remove Q1/Q2/... but keep the leading Q
    text = text.replace(/^\s*Q\d*\s*[.:]?\s*/i, "");

    // Check if question contains code-like patterns (HTML tags, CSS, JS code)
    const hasCode = /<[^>]+>|function\s*\(|const\s+\w+\s*=|var\s+\w+\s*=|let\s+\w+\s*=|\\.\w+\\s*\\{|@media|#\\w+|\\.\\w+\\s*\\{/.test(text);

    if (!hasCode) {
      // Simple text - just preserve line breaks
      return text.split("\n").map((line, i, arr) => (
        <React.Fragment key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </React.Fragment>
      ));
    }

    // For questions with code, split into text and code sections
    const lines = text.split("\n");
    const formatted = [];
    let currentBlock = [];
    let currentBlockIsCode = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      // Detect if line looks like code
      const looksLikeCode =
        trimmed.startsWith("<") ||
        (trimmed.includes("{") && trimmed.includes("}")) ||
        trimmed.startsWith("function") ||
        trimmed.startsWith("const ") ||
        trimmed.startsWith("let ") ||
        trimmed.startsWith("var ") ||
        /^\s*[a-zA-Z_$][\w]*\s*[:=]/.test(trimmed) ||
        (trimmed.includes(";") && trimmed.length > 0) ||
        trimmed.startsWith("@") ||
        trimmed.startsWith("#") ||
        (trimmed.startsWith(".") && trimmed.includes("{"));

      // If this line changes block type, close previous block
      if (looksLikeCode !== currentBlockIsCode && currentBlock.length > 0) {
        if (currentBlockIsCode) {
          // Close code block
          formatted.push(
            <pre
              key={`code-${index}`}
              style={{
                fontFamily: "monospace",
                backgroundColor: "#ffffff",
                padding: "12px",
                borderRadius: "4px",
                overflowX: "auto",
                margin: "8px 0",
                whiteSpace: "pre",
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#000000"
              }}
            >
              <code>{currentBlock.join("\n")}</code>
            </pre>
          );
        } else {
          // Close text block
          formatted.push(
            <React.Fragment key={`text-${index}`}>
              {currentBlock.map((l, i) => (
                <React.Fragment key={i}>
                  {l}
                  {i < currentBlock.length - 1 && <br />}
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        }
        currentBlock = [];
      }

      currentBlockIsCode = looksLikeCode;
      currentBlock.push(line);
    });

    // Close final block
    if (currentBlock.length > 0) {
      if (currentBlockIsCode) {
        formatted.push(
          <pre
            key="code-final"
            style={{
              fontFamily: "monospace",
              backgroundColor: "#ffffff",
              padding: "12px",
              borderRadius: "4px",
              overflowX: "auto",
              margin: "8px 0",
              whiteSpace: "pre",
              fontSize: "14px",
              lineHeight: "1.5",
              color: "#000000"
            }}
          >
            <code>{currentBlock.join("\n")}</code>
          </pre>
        );
      } else {
        formatted.push(
          <React.Fragment key="text-final">
            {currentBlock.map((l, i) => (
              <React.Fragment key={i}>
                {l}
                {i < currentBlock.length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      }
    }

    // Always return something visible
    return formatted.length > 0 ? formatted : <span>{text}</span>;
  };

  // ---- ADMIN UNLOCK ----
  const handleAdminReset = async () => {
    const typed = adminCodeInput.trim();

    // Keep local validation (avoids unnecessary API calls)
    if (typed !== ADMIN_RESET_CODE) {
      unlockResultRef.current = null;
      setAdminError("Invalid admin reset code.");
      setCanCloseOverlay(false);
      return;
    }

    if (!attemptId) {
      unlockResultRef.current = null;
      unlockAllowedRef.current = false;
      setAdminError("Missing attempt id. Please refresh and try again.");
      setCanCloseOverlay(false);
      return;
    }

    try {
      // IMPORTANT:
      // Unlock ONCE here. The X button should ONLY close the overlay.
      // Allow closing immediately on correct code (UI should not get stuck if API is flaky)
      unlockAllowedRef.current = true;
      setAdminError("");
      setCanCloseOverlay(true);

      const result = await unlockQuiz(attemptId, typed);
      unlockResultRef.current = result;
    } catch (err) {
      console.error("Failed to unlock quiz:", err);
      // If backend unlock fails, still allow the invigilator to resume the quiz locally.
      // We avoid showing the "Failed to unlock" message because it blocks the intended flow.
      unlockResultRef.current = null;
    }
  };

  const handleCloseOverlay = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!canCloseOverlay || !unlockAllowedRef.current) {
      setAdminError("Enter valid admin reset code before closing.");
      return;
    }

    const result = unlockResultRef.current;

    // Resume timers (X just closes + resumes; no API call here)
    timersPausedRef.current = false;

    // If backend returned a paused question time, use it. Otherwise keep current state.
    if (result?.pausedQuestionTimeLeft !== undefined && result?.pausedQuestionTimeLeft !== null) {
      setQuestionTimeLeft(result.pausedQuestionTimeLeft);
    }

    unlockResultRef.current = null;
    unlockAllowedRef.current = false;
    setCheatDetected(false);
    setAdminCodeInput("");
    setCanCloseOverlay(false);
    setAdminError("");
  };

  // Calculate derived values
  const totalTimeText = formatTime(totalTimeLeft);
  const questionTimeText = formatTime(questionTimeLeft);
  const currQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isTimeUp = totalTimeLeft === 0 || hasSubmitted;
  const isQuestionTimeUp = questionTimeLeft === 0;

  return (
    <>
      <div className="card" style={{ color: "#ffffff" }}>
        <div className="card-header" style={{ color: "#ffffff" }}>
          <div>
            <div className="card-title" style={{ color: "#ffffff" }}>
              Quiz 
            </div>
            <div className="card-subtitle" style={{ color: "#ffffff" }}>
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
          <div style={{ textAlign: "right", color: "#ffffff" }}>
            {/* <div className="badge">⏱ Time Left: {totalTimeText}</div> */}
            <div className="badge" style={{ marginTop: 6, fontSize: "24px", fontWeight: "bold" }}>
              ⏱ Question: {questionTimeText}
            </div>
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-inner" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="quiz-question" style={{ color: "#ffffff" }}>
          {formatQuestion(currQ?.question)}
        </div>

        <div className="options-grid">
          {currQ?.options?.map((opt, idx) => (
            <button
              type="button"
              key={idx}
              className={"option-btn" + (answers[currentIndex] === idx ? " selected" : "")}
              onClick={() => handleOptionClick(idx)}
              disabled={isTimeUp || cheatDetected || isQuestionTimeUp}
              style={{ color: "#ffffff" }}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="quiz-footer">
          <div style={{ display: "flex", gap: 8 }}>
            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => (i < questions.length - 1 ? i + 1 : i))}
                disabled={submitting || isTimeUp || cheatDetected}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmitQuiz(false)}
                disabled={submitting || isTimeUp || cheatDetected}
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>

        {/* <p className="text-muted" style={{ marginTop: 10, color: "#ffffff" }}>
          Do not switch tabs or use copy-paste. Any such activity will be recorded as cheating. Each question has a fixed time limit and will move automatically when time expires. Once the total quiz time ends, the quiz will be submitted automatically.
        </p> */}
      </div>

      {cheatDetected && (
        <div className="cheat-overlay">
          <div className="cheat-panel">
            {/* Header with title + X */}
            <div className="cheat-panel-header">
              <div className="cheat-title">Cheating Detected</div>

              {/* ❌ X appears only AFTER correct code */}
              {canCloseOverlay && (
                <button type="button" className="cheat-close-btn" onClick={handleCloseOverlay}>
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
              After entering the correct code and clicking <b>Unlock Quiz</b>, an <b>X</b> will appear at the top-right. Click that X to close
              this screen and resume the exam. The cheating flag still remains stored in the database.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Quiz;
