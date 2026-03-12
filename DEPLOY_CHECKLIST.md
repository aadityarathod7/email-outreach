# Render Deployment Checklist

## Pre-Deployment (Do Locally)

- [ ] Code builds without errors: `npm run build`
- [ ] Backend starts: `npm run dev:backend` (should run on port 3000)
- [ ] Frontend builds: `npm run build:frontend` (check `frontend-dist` folder created)
- [ ] App runs: `npm start` (visit http://localhost:3000)
- [ ] All changes committed: `git status` shows clean working tree
- [ ] Code pushed to GitHub: `git push origin main`
- [ ] Latest code is on main branch

## Environment Variables to Add in Render

Copy these from your `.env` file and add them in Render dashboard:

```
OPENAI_API_KEY=
GMAIL_USER=
GMAIL_APP_PASSWORD=
BRAND_NAME=
SENDER_NAME=
BRAND_URL=
POLL_INTERVAL_MINUTES=30
MAX_EMAILS_PER_BATCH=5
DELAY_BETWEEN_EMAILS_MS=5000
CSV_SENDER_EMAIL=
```

## Render Setup Steps

1. **Create Render Account**
   - [ ] Sign up at https://render.com
   - [ ] Connect GitHub account

2. **Create Web Service**
   - [ ] Click "New +" → "Web Service"
   - [ ] Select email-outreach repository
   - [ ] Name: `email-outreach`
   - [ ] Environment: `Node`
   - [ ] Build Command: `npm install && npm run build`
   - [ ] Start Command: `npm start`
   - [ ] Plan: `Free` (or `Starter`)

3. **Add Environment Variables**
   - [ ] Go to "Environment" tab
   - [ ] Add all variables from above
   - [ ] Click "Save"

4. **Deploy**
   - [ ] Click "Create Web Service"
   - [ ] Wait for build to complete (2-5 min)
   - [ ] Check logs for errors
   - [ ] Note the service URL (https://email-outreach-xxxxx.onrender.com)

## Post-Deployment Verification

- [ ] Visit service URL in browser: https://email-outreach-xxxxx.onrender.com
- [ ] Dashboard page loads
- [ ] Check health endpoint: https://email-outreach-xxxxx.onrender.com/api/health
- [ ] Response shows: `{"status":"ok",...}`
- [ ] Try uploading a CSV to test email sending
- [ ] Check logs for any errors

## Important Notes

⚠️ **Free Tier Limitations:**
- App spins down after 15 minutes of inactivity (cold start ~30s)
- Database resets on redeploy (use file uploads to repopulate)
- Limited RAM/CPU

✅ **To Enable Auto-Deploy:**
- Render automatically redeploys when you push to `main`
- No additional configuration needed
- Can be disabled in service settings if needed

## Troubleshooting

### Build Fails
1. Check build logs in Render dashboard
2. Run `npm run build` locally to verify it works
3. Make sure all dependencies are in `package.json`

### App Crashes After Deploy
1. Check logs for TypeScript errors
2. Verify environment variables are set
3. Try manual redeploy from Render dashboard

### Can't Access Dashboard
1. Wait 1-2 minutes for initial startup
2. Check if service says "Live" in dashboard
3. Try opening `/api/health` to test backend

### Emails Not Sending
1. Verify Gmail credentials are correct
2. Check app-specific password (not account password)
3. Look at server logs for error messages
4. Test locally first: `npm run dev`

## Next Steps

1. ✅ Deploy app to Render
2. ⏭️ Test email sending with sample CSV
3. ⏭️ Monitor logs for issues
4. ⏭️ Set up persistent database (if needed)

---

For detailed guide, see: `RENDER_DEPLOYMENT.md`
