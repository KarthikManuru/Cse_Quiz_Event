import React, { useState, useEffect } from "react";
import "./styles.css";
import StartForm from "./components/StartForm";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import { resumeQuiz } from "./api";

function App() {
  const [stage, setStage] = useState("start"); // 'start' | 'quiz' | 'result'
  const [attempt, setAttempt] = useState(null); // {attemptId, questionSet, questions, timing info}
  const [result, setResult] = useState(null);
  const [resuming, setResuming] = useState(false);

  // Resume quiz on page load if attemptId exists in localStorage
  useEffect(() => {
    const savedAttemptId = localStorage.getItem("quizAttemptId");
    if (savedAttemptId && stage === "start") {
      handleResume(savedAttemptId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = (data) => {
    // Store attemptId in localStorage for resume capability
    if (data.attemptId) {
      localStorage.setItem("quizAttemptId", data.attemptId);
    }
    setAttempt(data);
    setStage("quiz");
  };

  const handleResume = async (attemptId) => {
    try {
      setResuming(true);
      const data = await resumeQuiz(attemptId);
      // Store attemptId again
      localStorage.setItem("quizAttemptId", attemptId);
      setAttempt(data);
      setStage("quiz");
    } catch (err) {
      console.error("Failed to resume quiz:", err);
      // Clear invalid attemptId
      localStorage.removeItem("quizAttemptId");
      // Stay on start screen
    } finally {
      setResuming(false);
    }
  };

  const handleFinished = (res) => {
    // Clear attemptId from localStorage on completion
    localStorage.removeItem("quizAttemptId");
    setResult(res);
    setStage("result");
  };

  return (
    <div className="app-root">
      {stage === "start" && (
        <>
          <StartForm onStarted={handleStart} />
          {resuming && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <p>Resuming quiz...</p>
            </div>
          )}
        </>
      )}

      {stage === "quiz" && attempt && (
        <Quiz
          attemptId={attempt.attemptId}
          questionSet={attempt.questionSet}
          questions={attempt.questions}
          quizStartTime={attempt.quizStartTime}
          quizEndTime={attempt.quizEndTime}
          perQuestionTimeLimit={attempt.perQuestionTimeLimit}
          totalQuizDuration={attempt.totalQuizDuration}
          timerPaused={attempt.timerPaused}
          pausedQuestionTimeLeft={attempt.pausedQuestionTimeLeft}
          pausedTotalTimeLeft={attempt.pausedTotalTimeLeft}
          currentQuestionIndex={attempt.currentQuestionIndex}
          onFinished={handleFinished}
        />
      )}

      {stage === "result" && result && (
        <Result score={result.score} total={result.total} />
      )}
    </div>
  );
}

export default App;
