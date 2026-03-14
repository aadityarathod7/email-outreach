# Quick Start Guide - Email Outreach App

## Prerequisites
- Node.js 18+ installed
- Gmail account with app password
- Groq API key

## Setup (One-time)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` file
Copy `.env.example` and fill in your values:
```bash
cp .env.example .env
```

Edit `.env` with:
```
GMAIL_USER=aayushi@artnovaai.com
GMAIL_APP_PASSWORD=[16-char app password from Google]
SMTP_USER=aayushi@artnovaai.com
SMTP_APP_PASSWORD=[same as above]
EMAIL_SERVICE=gmail
EMAIL_USER=aayushi@artnovaai.com
EMAIL_PASSWORD=[same as above]
LLM_API_KEY=[your Groq API key from console.groq.com]
BRAND_NAME=ArtNovaAI
BRAND_URL=https://www.artnovaai.com
SENDER_NAME=Aayushi
```

### 3. Start the App
```bash
npm run dev
```

This starts both:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173

## Using the App

### 1. Open Dashboard
Go to http://localhost:5173 in your browser

### 2. Upload CSV
Click "Email Sender" and upload a CSV with columns:
```
email,name,plan,totalImages,images.0,images.1,images.2
user@example.com,John Doe,Gold,3,anime art,cyberpunk,abstract
```

### 3. Generate Emails
- Click "Generate Emails"
- Preview will show personalized emails with NEW subject lines for each person
- Edit emails inline if needed

### 4. Send Emails
- Click "Send Now"
- Emails are sent with the new brand-style format:
  - Subject: Dynamic, benefit-focused
  - Opening: "I know you're looking for..."
  - Body: Problem + Solution
  - CTA: "See how effortless it is with your 2 free credits"
  - Signature: "Best, Aayushi"

### 5. View History
- Click "Email History" to see all sent emails
- Filter by email, name, or subject
- Delete individual records

## Testing the New Email Style

The emails now follow the exact format:

```
Subject: [Dynamic subject based on their creative niche]

Hi [Name],

I know you're looking for [relatable problem statement].

[Specific problem + How ArtNovaAI solves it]

See how effortless it is with your 2 free credits: artnovaai.com

Best,
Aayushi
```

Each email gets a **unique subject line** customized to their niche.

## Troubleshooting

### Port already in use
If port 3000 or 5173 is taken:
```bash
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Email sending fails
- Check `.env` has all 11 variables
- Verify Gmail app password (16 characters)
- Check Groq API key is valid

### LLM not generating emails
- Verify `LLM_API_KEY` is set
- Check internet connection to api.groq.com
- Look at backend logs for error messages

## Commands

```bash
npm run dev              # Start both backend & frontend
npm run dev:backend     # Backend only (port 3000)
npm run dev:frontend    # Frontend only (port 5173)
npm run build           # Build for production
npm start               # Run production build
```

## File Structure
- `src/frontend/` - React dashboard UI
- `src/backend/` - Express API server
- `src/ai/` - LLM email generation
- `src/sender/` - Gmail SMTP
- `src/db/` - SQLite database
- `src/parser/` - CSV parsing

## Next: Deployment

Once you've tested locally and emails look good:

**Option 1: Railway.app** ($5/month)
- SMTP works on free tier
- No code changes
- Best option

**Option 2: Render** (free + API)
- Use Resend/SendGrid instead of SMTP
- Requires code changes

See `DEPLOYMENT_PLATFORMS.md` for comparison.

---

**You're all set!** Run `npm run dev` and visit http://localhost:5173
