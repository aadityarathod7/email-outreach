# Email Outreach - Quick Start

## Your LLM API is Already Configured ✅

Your `.env` file is pre-filled with your LLM API key:
```
LLM_API_KEY=ca0bb886f508c5b7ebd83ca5bee3e27f19263b33b665a3eee1b203c90e37347b
```

Just follow these 3 steps to get started.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Email Account

Edit `.env` and update:
```env
# Gmail Account (for reading CSVs)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Email Sending Account (for SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-sending-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Your Brand
BRAND_NAME=Your Brand
BRAND_URL=https://yourbrand.com
SENDER_NAME=Your Name
```

**Need a Gmail App Password?** [See SETUP.md](SETUP.md#3-generate-gmail-app-password)

## Step 3: Test & Run

### Test with sample CSV (no real emails sent)
```bash
npx ts-node src/index.ts --test-csv=data/test.csv
```

### Run normally (monitors Gmail, sends emails)
```bash
npx ts-node src/index.ts
```

### Run in production
```bash
npm run build
npm start
```

---

## What It Does

1. **Every 2 hours** – Checks Gmail for new emails with CSV attachments
2. **Parses CSV** – Extracts user email, name, plan, and image generation prompts
3. **Generates Email** – Uses your LLM API to create personalized emails
4. **Sends Email** – Sends via Gmail SMTP with rate limiting
5. **Logs Everything** – Tracks sent emails in SQLite, prevents duplicates

## CSV Format

Send emails with CSV attachments in this format:

```csv
email,name,plan,totalImages,images.0,images.1,images.2,images.3,images.4
john@example.com,John,free,12,"sunset over mountains","cyberpunk samurai","anime style","",""
jane@example.com,Jane,pro,45,"abstract patterns","portrait","nature landscape","fantasy","sci-fi"
```

Columns:
- `email` – user's email
- `name` – user's name
- `plan` – subscription plan
- `totalImages` – total images generated
- `images.0` through `images.4` – up to 5 image generation prompts

## Email Generation Example

Input CSV row:
```
john@example.com,John,free,12,"sunset watercolor","cyberpunk samurai","studio ghibli cat","",""
```

Generated email:
```
Subject: When your prompts come to life with AI

Body:
Hey John! I've been following what's happening in the AI art world, and your creative direction really caught my attention — those cyberpunk aesthetics mixed with whimsical character work are exactly the kind of thing that gets me excited about this space.

Since you've been using our tool for a bit now, I thought you might appreciate checking out some of the new features we've built. They're designed specifically for artists like you who are pushing boundaries with different styles.

What's your favorite prompt you've created so far? Would love to know what's resonating with you.
```

## Logs

Check what the app is doing:
```bash
# View logs in real-time
tail -f data/app.log

# Check sent emails in database
sqlite3 data/outreach.db "SELECT email, name, sent_at FROM sent_emails ORDER BY sent_at DESC LIMIT 10;"
```

## Configuration Reference

| Setting | Value | Notes |
|---------|-------|-------|
| `POLL_INTERVAL_MINUTES` | 120 (default) | How often to check Gmail |
| `MAX_EMAILS_PER_BATCH` | 50 (default) | Max emails per run |
| `DELAY_BETWEEN_EMAILS_MS` | 15000 (default) | Milliseconds between sends |
| `CSV_SENDER_EMAIL` | (optional) | Only process CSVs from this sender |

## Troubleshooting

**"Missing required environment variable"**
- Make sure all required fields in `.env` are filled

**"IMAP authentication failed"**
- Use Gmail App Password, not your regular password

**"No new emails found"**
- Check email was sent to GMAIL_USER
- Verify email has CSV attachment
- Check it matches CSV_SENDER_EMAIL (if configured)

**"LLM API error"**
- Verify LLM_API_KEY is correct (it's pre-filled)
- Check API has access

**"Email sending failed"**
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Check account has SMTP access enabled

## Project Structure

```
email-outreach/
├── src/
│   ├── ai/llmService.ts        ← Your LLM API integration
│   ├── sender/emailSender.ts   ← Email sending
│   ├── gmail/inboxReader.ts    ← Gmail reading
│   ├── parser/csvParser.ts     ← CSV parsing
│   ├── db/store.ts             ← Database
│   ├── config/env.ts           ← Config
│   ├── utils/logger.ts         ← Logging
│   └── index.ts                ← Main entry
├── data/
│   ├── outreach.db             (auto-created)
│   ├── app.log                 (auto-created)
│   └── processed/              (CSV backups)
├── .env                        ← Your configuration
└── package.json
```

## Next Steps

1. Generate Gmail App Password (if not done)
2. Update `.env` with your email credentials
3. Test: `npx ts-node src/index.ts --test-csv=data/test.csv`
4. Run: `npx ts-node src/index.ts`
5. Monitor: `tail -f data/app.log`

---

**Your LLM API is ready to generate beautiful personalized emails!** 🚀
