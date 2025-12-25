// frontend/src/api.js

// const DEFAULT_BASE_URL = "http://localhost:5000/api";

// export const API_BASE_URL =
//   process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;
export const API_BASE_URL = "https://cse-quiz-event.onrender.com/api";
// export const API_BASE_URL = "http://localhost:5000/api";

export async function startQuiz(data) {
  const res = await fetch(`${API_BASE_URL}/quiz/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed to start quiz");
  }
  return json;
}

export async function submitQuiz(data) {
  const res = await fetch(`${API_BASE_URL}/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to submit quiz");
  return res.json();
}

export async function flagCheat(attemptId, questionTimeLeft, totalTimeLeft, currentQuestionIndex) {
  await fetch(`${API_BASE_URL}/quiz/flag-cheat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      attemptId, 
      questionTimeLeft, 
      totalTimeLeft, 
      currentQuestionIndex 
    })
  });
}

export async function unlockQuiz(attemptId, adminCode) {
  const res = await fetch(`${API_BASE_URL}/quiz/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attemptId, adminCode })
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed to unlock quiz");
  }
  return json;
}

export async function resumeQuiz(attemptId) {
  const res = await fetch(`${API_BASE_URL}/quiz/resume/${attemptId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed to resume quiz");
  }
  return json;
}

export async function trackQuestion(attemptId, questionIndex) {
  await fetch(`${API_BASE_URL}/quiz/track-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attemptId, questionIndex })
  }).catch((err) => {
    console.error("Failed to track question:", err);
    // Non-critical, don't throw
  });
}