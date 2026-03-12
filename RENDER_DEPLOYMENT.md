# Deploying Email Outreach to Render

This guide walks you through deploying the Email Outreach app to Render.com.

## Prerequisites

- GitHub account with the email-outreach repository pushed
- Render.com account (free tier available at https://render.com)
- All environment variables ready (Gmail credentials, API keys, etc.)

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add -A
git commit -m "Prepare for Render deployment"
git push origin main
```

Verify the following files exist in your repo:
- `render.yaml` - Render configuration
- `package.json` - With build scripts
- `src/` - Backend source code
- `.env.example` - Environment variables template

### 2. Create a Render Account

1. Go to https://render.com
2. Click "Sign up" and create an account
3. Link your GitHub account (required for auto-deploy)

### 3. Deploy the Web Service

#### Option A: Using Render Dashboard (Recommended)

1. Log in to Render dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the email-outreach repository
5. Configure settings:
   - **Name**: `email-outreach` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter if you need better performance)

6. Click **"Advanced"** and add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (Render sets this automatically, but for clarity)
   - All variables from your `.env` file:
     - `OPENAI_API_KEY`
     - `GMAIL_USER`
     - `GMAIL_APP_PASSWORD`
     - `BRAND_NAME`
     - `SENDER_NAME`
     - `BRAND_URL`
     - etc.

7. Click **"Create Web Service"**

#### Option B: Using render.yaml (Auto-Deploy)

If you have `render.yaml` in your repo:

1. Commit and push the `render.yaml` file
2. Render will automatically detect it and use those settings
3. Still need to add environment variables in the Render dashboard

### 4. Set Environment Variables

After creating the service:

1. Go to your service dashboard
2. Click **"Environment"** tab
3. Add all required variables:

```
OPENAI_API_KEY=sk-...
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password
BRAND_NAME=Your Brand
SENDER_NAME=Your Name
BRAND_URL=https://yourbrand.com
POLL_INTERVAL_MINUTES=30
MAX_EMAILS_PER_BATCH=5
DELAY_BETWEEN_EMAILS_MS=5000
CSV_SENDER_EMAIL=optional-filter@example.com
```

**Important**: Never commit `.env` to GitHub. Only use `.env.example` as a template.

### 5. Wait for Deployment

1. Render will start building automatically
2. Watch the deploy logs (should take 2-5 minutes)
3. Once build completes, your app will be live at:
   ```
   https://email-outreach-<random-id>.onrender.com
   ```

### 6. Test Your Deployment

```bash
# Check if the app is running
curl https://email-outreach-<random-id>.onrender.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-03-12T...","appName":"Your Brand"}
```

Open the URL in your browser to access the dashboard.

## Database Persistence

Render's free tier **does not persist** the SQLite database between deployments.

### Options:

#### Option 1: Accept Fresh Database on Each Deploy
- Database resets when app restarts or is redeployed
- Good for testing/development
- Current setup does this

#### Option 2: Use External Database (PostgreSQL)
1. Create a Render PostgreSQL instance (free tier available)
2. Update `src/db/store.ts` to use PostgreSQL instead of SQLite
3. Add database connection string to environment variables
4. Requires code changes

#### Option 3: Use Render Disk Storage
1. Not available on free tier

For production use with persistent data, we recommend **Option 2** (PostgreSQL).

## Monitoring and Logs

### View Logs

1. Go to your service dashboard
2. Click **"Logs"** tab
3. Real-time logs appear here
4. Scroll to see deployment history

### Common Issues

#### Build Fails
- Check logs for TypeScript errors
- Verify `package.json` has all dependencies
- Ensure `npm run build` works locally first

#### App Starts but Shows "Not Found"
- Frontend might not have built
- Check that `vite build` completed successfully
- Verify `frontend-dist` folder exists after build

#### Emails Not Sending
- Verify environment variables are set correctly
- Check Gmail credentials and app password
- Look at logs for error messages
- Test locally first before deploying

## Auto-Deployment

Once linked to GitHub:
1. Every push to `main` branch triggers a new build
2. Automatic deployment on successful build
3. App restarts with new code
4. Can disable auto-deploy in settings if needed

## Scaling Up

Free tier limitations:
- 0.5 CPU, 512MB RAM
- Spins down after 15 minutes of inactivity (cold starts)
- Limited outbound bandwidth

To upgrade:
1. Go to service settings
2. Change plan from "Free" to "Starter" or higher
3. No downtime during upgrade

## Useful Render Commands

### Force Redeploy
1. Go to service dashboard
2. Click **"Deploy"** → **"Manual Deploy"**
3. Select latest commit and click **"Deploy"**

### Rollback to Previous Version
1. Click **"Deploy History"**
2. Find previous successful deploy
3. Click the three dots → **"Deploy"**

## Production Checklist

- [ ] Environment variables set securely (not in code)
- [ ] GMAIL_APP_PASSWORD is an app-specific password, not account password
- [ ] OPENAI_API_KEY is valid and has credits
- [ ] BRAND_NAME and SENDER_NAME configured
- [ ] Tested locally with `npm run build && npm start`
- [ ] GitHub repository is up to date
- [ ] No `.env` file committed to repo
- [ ] Render service created and variables added
- [ ] Deployment completed successfully
- [ ] API health check responds at `/api/health`
- [ ] Dashboard loads at service URL

## Support

For Render-specific issues:
- https://render.com/docs
- Render support: https://render.com/support

For Email Outreach issues:
- Check local logs: `npm run dev`
- Review API endpoints at `/api/health`
- Check database state at `/api/stats`

---

**Deployment URL**: Will be provided after first successful deploy
**Auto-rebuild**: Enabled - Any push to `main` triggers build
**Status Page**: Available in Render dashboard
