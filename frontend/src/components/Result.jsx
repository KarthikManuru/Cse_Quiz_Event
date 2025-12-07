import React from "react";

const Result = ({ score, total }) => {
  const percent = Math.round((score / total) * 100);

  let remark = "Good effort!";
  if (percent === 100) remark = "Perfect! Outstanding 🎉";
  else if (percent >= 80) remark = "Excellent performance 🔥";
  else if (percent >= 60) remark = "Nice work 👍";
  else if (percent >= 40) remark = "Keep improving 💪";
  else remark = "Don't worry. Learn and try again 🙂";

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Your Result</div>
          <div className="card-subtitle">Thank you for participating.</div>
        </div>
        <span className="badge">CSE Quiz</span>
      </div>

      <div className="result-score">
        {score} / {total}
      </div>
      <div className="card-subtitle" style={{ marginBottom: 16 }}>
        {percent}% – {remark}
      </div>

      <p className="text-muted" style={{ marginTop: 12 }}>
        Your responses and score have been securely recorded by the system.
        Please contact the event coordinator if you have any queries.
      </p>
    </div>
  );
};

export default Result;
