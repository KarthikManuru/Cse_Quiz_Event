# Question Update Guide

## ⚠️ Critical: How to Update Questions Correctly

This document explains why updating `questions.js` alone is **NOT sufficient** and provides the complete procedure to ensure new questions appear in the quiz.

---

## 🔍 Root Cause Analysis

### Why Old Questions Still Appear After Updating `questions.js`

The quiz system has **three layers of caching/persistence** that prevent new questions from appearing:

#### 1. **Node.js Module Caching**
- **Location**: `backend/routes/quizRoutes.js` line 3: `const questionSets = require("../data/questions");`
- **Behavior**: Node.js caches all `require()` modules in memory when the server starts
- **Impact**: Even if you edit `questions.js`, the running server continues using the **cached version** loaded at startup
- **Solution**: **Backend server MUST be restarted** after editing `questions.js`

#### 2. **MongoDB Persistence**
- **Location**: `backend/models/Attempt.js` - stores quiz attempts with full question data
- **Behavior**: When a student starts a quiz, the backend:
  1. Loads questions from `questionSets` (cached in memory)
  2. Sends questions to frontend
  3. Stores the attempt in MongoDB with `questionSet` key (A/B/C/D)
- **Impact**: Old attempts in MongoDB contain references to old question sets
- **Additional Issue**: The `/submit` endpoint (line 74) uses `questionSets[setKey]` to grade, so it also uses cached questions
- **Solution**: **Delete all existing attempts** from MongoDB before testing

#### 3. **Student ID Uniqueness Constraint**
- **Location**: `backend/routes/quizRoutes.js` lines 23-28
- **Behavior**: Each `studentId` is allowed **only ONE attempt** (enforced by unique index)
- **Impact**: If you reuse a `studentId` that already attempted the quiz:
  - The `/start` endpoint returns: `"This ID has already attempted the quiz."`
  - You cannot start a new quiz with the same ID
- **Solution**: **Use a brand-new `studentId`** that has never been used before

#### 4. **Render Deployment Caching** (Production)
- **Behavior**: Render may cache old builds unless explicitly cleared
- **Impact**: Even after pushing code, old version may run
- **Solution**: Use **"Clear build cache & deploy"** option in Render dashboard

---

## ✅ Complete Fix Procedure

Follow these steps **in order** to ensure new questions appear:

### Step 1: Stop the Backend Server
```bash
# If running locally:
# Press Ctrl+C in the terminal running the server

# If using nodemon, it may auto-restart, so kill the process:
# Windows: Task Manager or `taskkill /F /IM node.exe`
# Mac/Linux: `pkill -f node` or `killall node`
```

**Why**: Node.js must reload modules from disk, which only happens on server restart.

---

### Step 2: Delete All Quiz Attempts from MongoDB

**Option A: Using MongoDB Compass or MongoDB Atlas UI**
1. Connect to your MongoDB database
2. Navigate to the `attempts` collection
3. Delete all documents (or drop the collection)

**Option B: Using MongoDB Shell**
```bash
# Connect to MongoDB
mongosh "your-mongodb-connection-string"

# Delete all attempts
use your-database-name
db.attempts.deleteMany({})
```

**Option C: Using the provided utility script** (see below)
```bash
cd backend
node scripts/clearAttempts.js
```

**Why**: Old attempts contain references to old question sets. Even if you restart the server, existing attempts won't reflect new questions.

---

### Step 3: Verify `questions.js` Contains Updated Questions

1. Open `backend/data/questions.js`
2. Verify your changes are saved
3. Check that the file structure is correct (no syntax errors)

**Quick Check**: Count questions in `baseQuestions` array - should match your expected number.

---

### Step 4: Restart the Backend Server

```bash
cd backend
npm start
# or for development:
npm run dev
```

**Why**: This forces Node.js to reload `questions.js` from disk into memory.

**Verification**: Check server console for startup messages. If you see errors, fix them before proceeding.

---

### Step 5: If Deployed on Render

1. **Push updated code to GitHub**:
   ```bash
   git add backend/data/questions.js
   git commit -m "Update quiz questions"
   git push origin main
   ```

2. **Redeploy on Render**:
   - Go to Render dashboard
   - Select your backend service
   - Click **"Manual Deploy"** → **"Clear build cache & deploy"**
   - Wait for deployment to complete

**Why**: Render caches builds. Clearing cache ensures fresh code is deployed.

---

### Step 6: Clear Frontend Cache

**Option A: Hard Refresh Browser**
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

**Option B: Open in Incognito/Private Mode**
- This ensures no cached JavaScript is loaded

**Why**: Frontend may cache old API responses or JavaScript bundles.

---

### Step 7: Start Quiz with NEW Student ID

**Critical**: Use a `studentId` that has **never been used before**.

- ❌ **Don't reuse**: `"12345"`, `"test"`, `"student1"` (if already used)
- ✅ **Use new IDs**: `"12346"`, `"test2"`, `"student-new-2025"`, etc.

**Why**: The system enforces one attempt per `studentId`. Reusing an ID will block `/start` endpoint.

---

## 🧪 Verification Checklist

After completing all steps, verify:

- [ ] Backend server restarted (check console logs)
- [ ] MongoDB `attempts` collection is empty (or contains only new attempts)
- [ ] `questions.js` file has correct content
- [ ] Using a brand-new `studentId`
- [ ] Frontend shows updated questions
- [ ] If on Render, deployment completed successfully

---

## 🛠️ Utility Scripts

### Clear All Attempts Script

A utility script is provided at `backend/scripts/clearAttempts.js` to help clear the database.

**Usage**:
```bash
cd backend
node scripts/clearAttempts.js
```

**Note**: This script requires `MONGO_URI` in your `.env` file.

---

## 📝 Code Architecture Notes

### How Questions Flow Through the System

```
1. Server Startup
   └─> require("../data/questions") loads questions.js into memory
       └─> questionSets cached in Node.js module cache

2. Student Starts Quiz (/start endpoint)
   └─> Check if studentId exists in MongoDB
       └─> If exists: REJECT (one attempt per studentId)
       └─> If new: Continue
   └─> Select random question set (A/B/C/D)
   └─> Load questions from cached questionSets[setKey]
   └─> Send questions to frontend (without correctIndex)
   └─> Store attempt in MongoDB with questionSet key

3. Student Submits Quiz (/submit endpoint)
   └─> Load attempt from MongoDB
   └─> Get questionSet key from attempt
   └─> Load questions from cached questionSets[setKey]
   └─> Grade answers using cached questions
   └─> Store responses in MongoDB
```

### Key Files

- **`backend/data/questions.js`**: Source of truth for questions
- **`backend/routes/quizRoutes.js`**: Loads questions via `require()` (line 3)
- **`backend/models/Attempt.js`**: MongoDB schema for quiz attempts
- **`backend/server.js`**: Server entry point

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Only Editing `questions.js`
**Result**: Old questions still appear  
**Fix**: Restart backend server

### ❌ Mistake 2: Restarting Server But Reusing studentId
**Result**: `/start` endpoint rejects with "This ID has already attempted the quiz"  
**Fix**: Use a new `studentId`

### ❌ Mistake 3: Not Clearing MongoDB
**Result**: Old attempts still exist, but new attempts work correctly  
**Fix**: Delete all attempts from MongoDB

### ❌ Mistake 4: Not Redeploying on Render
**Result**: Production still runs old code  
**Fix**: Clear build cache and redeploy

### ❌ Mistake 5: Not Hard Refreshing Browser
**Result**: Frontend may show cached old questions  
**Fix**: Hard refresh or use incognito mode

---

## 💡 Future Improvements (Optional)

Consider these enhancements to make question updates easier:

1. **Hot Reload for Questions**: Use `fs.readFileSync()` instead of `require()` to read questions on each request (slower but always fresh)
2. **Question Versioning**: Add a version field to attempts to track which question set was used
3. **Admin Endpoint**: Create `/admin/clear-attempts` endpoint (protected) to clear attempts without database access
4. **Question Set Validation**: Add startup check to verify question sets are valid
5. **Development Mode**: Auto-clear attempts in development mode

---

## 📞 Troubleshooting

### Problem: Questions still old after following all steps

**Check**:
1. Is the backend server actually restarted? (Check process ID)
2. Are you editing the correct `questions.js` file? (Check file path)
3. Is there a syntax error in `questions.js`? (Check server console)
4. Are you using a truly new `studentId`? (Check MongoDB for existing IDs)
5. Is Render actually running the new code? (Check deployment logs)

### Problem: "This ID has already attempted the quiz" error

**Solution**: Use a different `studentId` or clear the attempts collection.

### Problem: Server crashes on startup after editing questions.js

**Solution**: Check for syntax errors in `questions.js`. Common issues:
- Missing commas
- Unclosed brackets
- Invalid JavaScript syntax

---

## 📚 Summary

**Golden Rule**: Changing `questions.js` alone is **NOT enough**.

**Required Steps**:
1. ✅ Stop backend server
2. ✅ Clear MongoDB attempts
3. ✅ Verify `questions.js` is correct
4. ✅ Restart backend server
5. ✅ Redeploy on Render (if production)
6. ✅ Hard refresh frontend
7. ✅ Use new `studentId`

Follow this guide every time you update questions to avoid confusion and ensure new questions appear correctly.

