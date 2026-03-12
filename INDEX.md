# Email Outreach - Documentation Index

Complete Node.js/TypeScript project for automated personalized AI-powered email outreach using **your custom LLM API**.

## 📚 Documentation Files

### Getting Started
- **[QUICK_START.md](QUICK_START.md)** ⚡ *Start here!*
  - 3-step setup guide
  - Your LLM API key is already configured
  - Test and run commands
  - 5 min read

- **[SETUP.md](SETUP.md)** 🚀
  - Detailed setup instructions
  - Gmail App Password generation
  - Configuration guide
  - Troubleshooting
  - 10 min read

- **[CHECKLIST.md](CHECKLIST.md)** ✅
  - Complete setup checklist
  - Verification steps
  - Quick command reference
  - Status tracking table

### Reference
- **[README.md](README.md)** 📖
  - Full project documentation
  - Architecture overview
  - Anti-spam implementation
  - Environment variables reference
  - Extensive troubleshooting
  - 20 min read

- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** 📋
  - What was updated from original spec
  - LLM API integration details
  - Comparison with bookcompanion project
  - Code patterns explained
  - 10 min read

## 🗂️ Project Structure

```
email-outreach/
├── src/
│   ├── index.ts                  Main entry + cron scheduler
│   ├── config/env.ts             Environment validation
│   ├── ai/llmService.ts          Your LLM API integration ⭐
│   ├── sender/emailSender.ts     Email sending service
│   ├── gmail/inboxReader.ts      Gmail IMAP reader
│   ├── parser/csvParser.ts       CSV parsing & validation
│   ├── db/store.ts               SQLite database
│   └── utils/logger.ts           Console + file logging
│
├── data/
│   ├── outreach.db               SQLite database (auto-created)
│   ├── app.log                   Application logs (auto-created)
│   └── processed/                CSV backups (auto-created)
│
├── .env                          Configuration (LLM key pre-filled) ⭐
├── .env.example                  Configuration template
├── package.json                  Dependencies
├── tsconfig.json                 TypeScript config
└── .gitignore                    Git ignore rules
```

## ⚡ Quick Start (3 Steps)

```bash
# 1. Install
npm install

# 2. Configure .env (email credentials)
# Your LLM_API_KEY is already set!

# 3. Test (no emails sent)
npx ts-node src/index.ts --test-csv=data/test.csv

# Run in production
npx ts-node src/index.ts
```

## 🔑 Your LLM API Key

**Pre-configured in `.env`:**
```
LLM_API_KEY=ca0bb886f508c5b7ebd83ca5bee3e27f19263b33b665a3eee1b203c90e37347b
```

- Endpoint: `https://aiplatform.dev51.cbf.dev.paypalinc.com/cosmosai/llm/v1`
- Model: `gpt-4o`
- Uses OpenAI SDK (like bookcompanion)
- Ready to generate personalized emails

## 🎯 What It Does

1. **Monitors Gmail** (every 2 hours) for emails with CSV attachments
2. **Parses CSV** containing user data and AI image generation prompts
3. **Generates Personalized Emails** using your LLM API
4. **Sends Emails** via Gmail SMTP with rate limiting
5. **Prevents Duplicates** using SQLite deduplication
6. **Logs Everything** to file and console

## 📊 CSV Format

```csv
email,name,plan,totalImages,images.0,images.1,images.2,images.3,images.4
john@example.com,John,free,12,"sunset mountains","cyberpunk","anime","",""
```

## ✨ Key Features

- ✅ Your custom LLM API integration
- ✅ Gmail IMAP reader
- ✅ Personalized email generation with creative interest analysis
- ✅ Email SMTP sender with anti-spam headers
- ✅ SQLite deduplication (never email same person twice)
- ✅ Cron scheduling (configurable interval)
- ✅ Rate limiting (15s between emails, configurable)
- ✅ Batch capping (50 per run, configurable)
- ✅ Plain text emails (better deliverability)
- ✅ Unsubscribe mechanism
- ✅ Comprehensive logging
- ✅ Graceful error handling with retries

## 🛠️ Tech Stack

- **Runtime:** Node.js + TypeScript
- **LLM API:** OpenAI SDK (your custom endpoint)
- **Email (Read):** IMAP via `imap` package
- **Email (Send):** Nodemailer
- **Database:** SQLite via `better-sqlite3`
- **Scheduling:** node-cron
- **CSV Parsing:** PapaParse

## 📖 Documentation Guide

### For first-time setup:
1. Read [QUICK_START.md](QUICK_START.md) (5 min)
2. Follow [SETUP.md](SETUP.md) (10 min)
3. Use [CHECKLIST.md](CHECKLIST.md) to verify

### For deep dive:
1. Read [README.md](README.md) for full documentation
2. Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for code details

### For troubleshooting:
- Check [README.md](README.md) → Troubleshooting section
- Run test mode: `npx ts-node src/index.ts --test-csv=data/test.csv`
- Check logs: `tail -f data/app.log`

## 🚀 Getting Started Now

**Estimated time: 15 minutes**

```bash
# Navigate to project
cd email-outreach

# Install dependencies
npm install

# Edit .env with your email credentials
# (Your LLM_API_KEY is already set!)

# Test configuration
npx ts-node src/index.ts --test-csv=data/test.csv

# If test looks good, run in development
npx ts-node src/index.ts

# Check logs
tail -f data/app.log
```

## 📋 Configuration

All settings in `.env`:

```env
# Gmail IMAP (read CSVs)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=app-password

# Email SMTP (send emails)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password

# LLM API (already configured!)
LLM_API_KEY=ca0bb886f508c5b7ebd83ca5bee3e27f19263b33b665a3eee1b203c90e37347b

# Brand
BRAND_NAME=Your Brand
BRAND_URL=https://yourbrand.com
SENDER_NAME=Your Name

# Optional tuning
POLL_INTERVAL_MINUTES=120
MAX_EMAILS_PER_BATCH=50
DELAY_BETWEEN_EMAILS_MS=15000
```

## 💡 Pro Tips

1. **Start small** – Use `MAX_EMAILS_PER_BATCH=5` for first week
2. **Monitor delivery** – Check `data/app.log` for any issues
3. **Test first** – Always use `--test-csv` before going live
4. **Adjust tone** – Edit the system prompt in `src/ai/llmService.ts` for different voice
5. **Track results** – Query SQLite to see sent emails:
   ```bash
   sqlite3 data/outreach.db "SELECT COUNT(*) FROM sent_emails;"
   ```

## 🔐 Security

- ✅ Credentials in `.env` (not in code)
- ✅ App passwords for Gmail (not regular password)
- ✅ Plain text emails (no tracking pixels)
- ✅ Proper unsubscribe mechanism
- ✅ No secrets in `.gitignore`
- ✅ TypeScript strict mode (no `any` types)

## 📞 Support

- 📖 Full documentation in [README.md](README.md)
- 🚀 Setup help in [SETUP.md](SETUP.md)
- ⚡ Quick reference in [QUICK_START.md](QUICK_START.md)
- ✅ Checklist in [CHECKLIST.md](CHECKLIST.md)
- 📋 Technical details in [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

**Your LLM API is ready. Your email outreach system is ready. Let's go! 🚀**
