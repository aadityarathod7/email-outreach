# Quick Start: Deploy to Render in 5 Minutes

## 1. Prepare Locally

```bash
# Make sure everything builds
npm run build

# Should complete without errors
```

## 2. Push to GitHub

```bash
git push origin main
```

## 3. Create Render Service

1. Go to https://render.com and sign in
2. Click **"New +"** → **"Web Service"**
3. Select your `email-outreach` GitHub repo
4. Fill in:
   - **Name**: `email-outreach`
   - **Build**: `npm install && npm run build`
   - **Start**: `npm start`
   - **Plan**: Free

## 4. Add Environment Variables

Click **"Advanced"** and add (get values from your `.env`):

```
OPENAI_API_KEY=sk-...
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
BRAND_NAME=Your Brand
SENDER_NAME=Your Name
BRAND_URL=https://yourbrand.com
```

## 5. Deploy

Click **"Create Web Service"** and wait 2-5 minutes.

## 6. Test

Your app will be live at: `https://email-outreach-xxxxx.onrender.com`

Visit the URL → Dashboard should load ✅

## 📌 Important Notes

- **Free tier**: App sleeps after 15 min of inactivity (takes ~30s to wake up)
- **Database**: Resets on redeploy (create test emails first)
- **Auto-deploy**: Every push to `main` automatically redeploys
- **Logs**: Check Render dashboard → "Logs" tab for errors

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Run `npm run build` locally to debug |
| App won't start | Check environment variables in Render |
| Can't send emails | Verify GMAIL_APP_PASSWORD (not account password) |
| Dashboard blank | Wait 30s, refresh, check browser console for errors |

## 📚 Full Guides

- **Detailed steps**: See `RENDER_DEPLOYMENT.md`
- **Checklist**: See `DEPLOY_CHECKLIST.md`
- **Config file**: See `render.yaml`

---

That's it! Your app is live. 🚀
