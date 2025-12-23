# Quick Update Checklist

When updating `questions.js`, follow these steps:

## ✅ Quick Checklist

- [ ] **Stop backend server** (Ctrl+C or kill process)
- [ ] **Clear MongoDB attempts**: `npm run clear-attempts`
- [ ] **Verify** `questions.js` has your changes saved
- [ ] **Restart backend**: `npm start` or `npm run dev`
- [ ] **If on Render**: Push to GitHub + Redeploy with "Clear build cache"
- [ ] **Hard refresh browser** (Ctrl+Shift+R) or use Incognito
- [ ] **Use NEW studentId** (never used before)

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| Old questions still show | Restart backend server |
| "ID already attempted" error | Use a different studentId |
| Questions wrong after restart | Clear MongoDB attempts |
| Production still shows old | Redeploy on Render with cache clear |

## 📖 Full Guide

See `QUESTION_UPDATE_GUIDE.md` for detailed explanation.

