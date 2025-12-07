import React, { useState } from "react";
import "./styles.css";
import StartForm from "./components/StartForm";
import Quiz from "./components/Quiz";
import Result from "./components/Result";

function App() {
  const [stage, setStage] = useState("start"); // 'start' | 'quiz' | 'result'
  const [attempt, setAttempt] = useState(null); // {attemptId, questionSet, questions}
  const [result, setResult] = useState(null);

  const handleStart = (data) => {
    setAttempt(data);
    setStage("quiz");
  };

  const handleFinished = (res) => {
    setResult(res);
    setStage("result");
  };

  return (
    <div className="app-root">
      {stage === "start" && <StartForm onStarted={handleStart} />}

      {stage === "quiz" && attempt && (
        <Quiz
          attemptId={attempt.attemptId}
          questionSet={attempt.questionSet}
          questions={attempt.questions}
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
