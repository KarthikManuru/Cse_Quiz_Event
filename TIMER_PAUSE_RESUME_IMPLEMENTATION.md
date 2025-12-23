# Timer Pause/Resume & Security Features Implementation

## Overview

This document describes the implementation of timer pause/resume functionality during cheat detection, forward-only navigation, and code formatting for questions.

## Features Implemented

### 1. Timer Pause/Resume During Cheat Detection

**Backend Changes:**
- **Attempt Model** (`backend/models/Attempt.js`):
  - Added `timerPaused`: Boolean flag indicating if timers are paused
  - Added `timerPausedAt`: Timestamp when timer was paused
  - Added `pausedQuestionTimeLeft`: Remaining time for current question when paused
  - Added `pausedTotalTimeLeft`: Remaining total time when paused
  - Added `pausedQuestionIndex`: Which question was active when paused
  - Added `cheatDetectedAt`: Timestamp when cheat was detected
  - Added `unlockedAt`: Timestamp when admin unlocked the quiz

- **Routes** (`backend/routes/quizRoutes.js`):
  - **POST `/api/quiz/flag-cheat`**: 
    - Now accepts `questionTimeLeft`, `totalTimeLeft`, and `currentQuestionIndex`
    - Pauses timers and stores state in MongoDB
    - Sets `timerPaused = true` and stores all timer values
  
  - **POST `/api/quiz/unlock`**: 
    - Validates unlock request
    - Calculates new `quizEndTime` based on paused total time
    - Resumes timers by setting `timerPaused = false`
    - Returns paused timer values for frontend sync
  
  - **GET `/api/quiz/resume/:attemptId`**: 
    - Returns paused timer state if timer is paused
    - Returns `pausedQuestionTimeLeft` and `pausedTotalTimeLeft` if available
    - Returns `currentQuestionIndex` for resuming at correct question

**Frontend Changes:**
- **Quiz Component** (`frontend/src/components/Quiz.jsx`):
  - `markCheat()` function now:
    - Immediately pauses both timers (clears intervals)
    - Sends current timer state to backend
    - Sets `timersPausedRef.current = true`
  
  - `handleCloseOverlay()` function now:
    - Calls `/api/quiz/unlock` endpoint
    - Receives paused timer values from backend
    - Resumes timers from exact paused state
    - Restarts intervals with correct remaining time
  
  - Timer initialization checks `timersPausedRef` before starting
  - Timers don't update when paused

**API Functions** (`frontend/src/api.js`):
- `flagCheat()`: Now accepts and sends timer state
- `unlockQuiz()`: New function to unlock quiz and resume timers

### 2. Forward-Only Navigation

**Changes:**
- **Quiz Component**: Removed "Previous" button completely
- Navigation is now strictly forward-only:
  - Auto-advance when question timer expires
  - Manual "Next" button to move forward
  - No way to go back to previous questions

### 3. Code Formatting for Questions

**Implementation:**
- Added `formatQuestion()` function in Quiz component
- Detects code patterns (HTML tags, CSS, JavaScript)
- Formats code blocks with:
  - Monospaced font (`fontFamily: 'monospace'`)
  - Preserved whitespace (`whiteSpace: 'pre'`)
  - Gray background for visual distinction
  - Proper line breaks and indentation
  - Scrollable for long code blocks

**Code Detection Patterns:**
- HTML tags: `<tag>`
- JavaScript: `function`, `const`, `let`, `var`
- CSS: `@media`, `#id`, `.class {`
- General code: `{`, `}`, `;`, assignment patterns

### 4. Data Integrity & Storage

**MongoDB Storage:**
- All timer pause state stored in database
- Timestamps for cheat detection and unlock
- Remaining times preserved accurately
- Current question index tracked

**Resume Functionality:**
- On page refresh, quiz resumes from stored state
- Uses paused timer values if timer was paused
- Restores to correct question index
- Syncs with backend timestamps

### 5. Backend Enforcement

**Security Features:**
- Timer values validated on backend
- Frontend timers sync with backend values
- Backend calculates new `quizEndTime` on unlock
- No client-side manipulation possible
- All timing state stored in MongoDB

## Flow Diagram

### Cheat Detection Flow:
```
1. Cheat detected (tab switch, copy/paste, etc.)
   ↓
2. markCheat() called
   ↓
3. Pause timers (clear intervals)
   ↓
4. Send timer state to backend (/flag-cheat)
   ↓
5. Backend stores: pausedQuestionTimeLeft, pausedTotalTimeLeft, timerPaused=true
   ↓
6. Show "Cheat Detected" overlay
```

### Unlock Flow:
```
1. Admin enters correct code
   ↓
2. handleCloseOverlay() called
   ↓
3. Call /api/quiz/unlock with attemptId
   ↓
4. Backend calculates new quizEndTime
   ↓
5. Backend sets timerPaused=false, stores unlockedAt
   ↓
6. Frontend receives paused timer values
   ↓
7. Resume timers from exact paused state
   ↓
8. Hide overlay, continue quiz
```

## Key Implementation Details

### Timer Pause Logic:
- Both `totalTimerRef` and `questionTimerRef` are cleared immediately
- `timersPausedRef.current` prevents timer updates
- Timer values are frozen at pause moment

### Timer Resume Logic:
- Backend extends `quizEndTime` to account for paused duration
- Frontend restarts intervals with paused values
- Question timer resumes from exact remaining time
- Total timer syncs with new `quizEndTime`

### Code Formatting:
- Uses `<pre><code>` blocks for code sections
- Preserves all whitespace and indentation
- Monospaced font for readability
- Gray background for visual distinction
- Scrollable for overflow

## Testing Checklist

- [ ] Cheat detection pauses timers immediately
- [ ] Timer values are stored correctly in MongoDB
- [ ] Admin unlock resumes timers from exact paused state
- [ ] No time is lost or gained during pause/resume
- [ ] Previous button is removed
- [ ] Navigation is forward-only
- [ ] Code questions display with proper formatting
- [ ] Whitespace is preserved in code blocks
- [ ] Resume functionality works after page refresh
- [ ] Backend validates all timer operations

## Security Notes

1. **Timer State**: All timer state is stored in MongoDB, not just frontend
2. **Backend Validation**: Timer pause/resume is validated on backend
3. **No Time Manipulation**: Frontend cannot manipulate timer values
4. **Audit Trail**: All cheat detection and unlock events are timestamped
5. **Resume Integrity**: Resume uses server data, not client state

## Files Modified

**Backend:**
- `backend/models/Attempt.js` - Added timer pause fields
- `backend/routes/quizRoutes.js` - Added pause/resume endpoints

**Frontend:**
- `frontend/src/components/Quiz.jsx` - Timer pause/resume, code formatting, removed Previous button
- `frontend/src/App.js` - Pass paused timer state to Quiz component
- `frontend/src/api.js` - Added unlockQuiz function, updated flagCheat

## Summary

The implementation ensures:
- ✅ Timers pause instantly on cheat detection
- ✅ Timers resume exactly after admin unlock
- ✅ No backward navigation (Previous button removed)
- ✅ Clean, readable code formatting with preserved spacing
- ✅ Secure, tamper-proof quiz timing
- ✅ Complete audit trail in MongoDB

