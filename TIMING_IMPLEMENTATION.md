# Quiz Timing System Implementation

## Overview

This document describes the implementation of the timed quiz system with the following features:
- 45 seconds per question
- 15 minutes total quiz duration
- Auto-advance on question timeout
- Auto-submit on total timeout
- Resume capability on page refresh
- Server-enforced timing validation

## Implementation Details

### Backend Changes

#### 1. Database Model (`backend/models/Attempt.js`)
Added timing fields to the Attempt schema:
- `quizStartTime`: Server timestamp when quiz started
- `quizEndTime`: Calculated end time (quizStartTime + totalQuizDuration)
- `perQuestionTimeLimit`: 45 seconds (server-defined)
- `totalQuizDuration`: 900 seconds (15 minutes, server-defined)
- `questionDisplayTimes`: Array of timestamps when each question was displayed
- `currentQuestionIndex`: Track current question for resume

#### 2. Backend Routes (`backend/routes/quizRoutes.js`)

**POST `/api/quiz/start`**
- Validates all form fields (name, Techzite ID, email)
- Validates email format
- Checks Techzite ID uniqueness (one attempt per ID)
- Sets server timestamps (quizStartTime, quizEndTime)
- Returns timing data to frontend

**GET `/api/quiz/resume/:attemptId`**
- Retrieves quiz state from MongoDB
- Calculates remaining time based on server timestamps
- Returns questions and timing data for resumption

**POST `/api/quiz/track-question`**
- Records when each question is displayed
- Stores timestamps in MongoDB for auditing

**POST `/api/quiz/submit`**
- Validates timing on backend
- Prevents submission after quiz end time
- Stores all responses with timestamps

### Frontend Changes

#### 1. Start Form (`frontend/src/components/StartForm.jsx`)
- Already includes:
  - Full Name field
  - Techzite ID field (labeled correctly)
  - Email ID field with validation
  - Client-side validation for all fields
  - Email format validation

#### 2. Quiz Component (`frontend/src/components/Quiz.jsx`)

**Timing Features:**
- **Total Timer**: 15 minutes (900 seconds) countdown
  - Synchronized with server timestamps
  - Auto-submits when time expires
  - Displays in red when ≤ 60 seconds remaining

- **Per-Question Timer**: 45 seconds countdown
  - Resets when question changes
  - Auto-advances to next question when expires
  - Displays in red when ≤ 10 seconds remaining
  - Disables navigation when expired

**Auto-Advance Logic:**
- When question timer reaches 0:
  - If not last question: Move to next question
  - If last question: Auto-submit quiz

**Auto-Submit Logic:**
- When total timer reaches 0: Automatically submit quiz
- Prevents further interaction

**Resume Support:**
- Tracks question display times
- Uses server timestamps for accurate time calculation
- Resumes from correct question and time on page refresh

#### 3. App Component (`frontend/src/App.js`)

**Resume Functionality:**
- Stores `attemptId` in localStorage on quiz start
- Attempts to resume quiz on page load if `attemptId` exists
- Calls `/api/quiz/resume/:attemptId` to get current state
- Passes timing data to Quiz component

**Props Passed to Quiz:**
- `quizStartTime`: ISO string from backend
- `quizEndTime`: ISO string from backend
- `perQuestionTimeLimit`: 45 seconds
- `totalQuizDuration`: 900 seconds

### API Functions (`frontend/src/api.js`)

**New Functions:**
- `resumeQuiz(attemptId)`: Fetches quiz state for resumption
- `trackQuestion(attemptId, questionIndex)`: Records question display time

**Existing Functions (Updated):**
- `startQuiz(data)`: Now returns timing data
- `submitQuiz(data)`: Validates timing on backend

## Security Features

1. **Server-Enforced Timing**
   - All timing values are set by the backend
   - Frontend timers are synchronized with server timestamps
   - Backend validates timing on submission

2. **Prevent Manipulation**
   - Timer values cannot be modified by client
   - Server calculates remaining time based on stored timestamps
   - Resume functionality uses server data, not client state

3. **Audit Trail**
   - Question display times stored in MongoDB
   - Quiz start/end times recorded
   - All timestamps are server-generated

## User Experience

### Timer Display
- **Total Timer**: Shows remaining time for entire quiz (15 minutes)
- **Question Timer**: Shows remaining time for current question (45 seconds)
- **Visual Warnings**: Timers turn red when time is running low

### Auto-Navigation
- Questions automatically advance when 45 seconds expire
- Quiz automatically submits when 15 minutes expire
- Users cannot navigate after time expires

### Resume Capability
- If page is refreshed or connection is lost:
  - Quiz automatically resumes from saved state
  - Timer continues from correct remaining time
  - Current question is restored

## Testing Checklist

- [ ] Start quiz with valid Techzite ID
- [ ] Verify total timer starts at 15:00
- [ ] Verify question timer starts at 0:45
- [ ] Verify question timer resets on question change
- [ ] Verify auto-advance when question timer expires
- [ ] Verify auto-submit when total timer expires
- [ ] Verify navigation is disabled after time expires
- [ ] Verify resume functionality on page refresh
- [ ] Verify email validation works
- [ ] Verify Techzite ID uniqueness check
- [ ] Verify backend timing validation on submit

## Database Schema

```javascript
{
  name: String,
  studentId: String (unique), // Techzite ID
  email: String,
  questionSet: String, // A/B/C/D
  quizStartTime: Date,
  quizEndTime: Date,
  perQuestionTimeLimit: Number, // 45
  totalQuizDuration: Number, // 900
  questionDisplayTimes: [Date],
  currentQuestionIndex: Number,
  responses: [...],
  score: Number,
  status: "in-progress" | "submitted",
  // ... other fields
}
```

## Notes

- All timing values are in seconds
- Server timestamps are in UTC
- Frontend displays time in MM:SS format
- Timer updates every 1 second
- Question display times are tracked for auditing

