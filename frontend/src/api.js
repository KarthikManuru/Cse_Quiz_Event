// frontend/src/api.js

const DEFAULT_BASE_URL = "http://localhost:5000/api";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;

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

export async function flagCheat(attemptId) {
  await fetch(`${API_BASE_URL}/quiz/flag-cheat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attemptId })
  });
}
