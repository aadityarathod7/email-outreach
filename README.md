# Email Outreach

Automated personalized AI-powered email outreach using Claude API. This application monitors a Gmail inbox for CSV attachments containing user data, generates personalized emails using Claude, and sends them via Gmail SMTP with built-in anti-spam safeguards.

## What It Does

1. **Every 2 hours** (configurable), connects to Gmail via IMAP and checks for new emails with CSV attachments
2. **Parses CSV data** containing user information and AI image generation prompts
3. **Generates personalized emails** using Claude API, analyzing each user's creative interests
4. **Sends emails via Gmail SMTP** with rate limiting and anti-spam best practices
5. **Tracks all sent emails** in SQLite to prevent duplicates

## CSV Format

The incoming CSV should have these columns:

```
email,name,plan,totalImages,images.0,images.1,images.2,images.3,images.4
john@example.com,John,free,12,"sunset over mountains","cyberpunk samurai","studio ghibli cat","",""
```

- `email` – user's email address
- `name` – user's name
- `plan` – subscription plan (free, pro, etc.)
- `totalImages` – total images they've generated
- `images.0` through `images.4` – up to 5 AI image prompts

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
SMTP_USER=your-sending@gmail.com
SMTP_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_SERVICE=gmail
EMAIL_USER=your-sending@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
LLM_API_KEY=your-llm-api-key
BRAND_NAME=YourAITool
BRAND_URL=https://yourtool.com
SENDER_NAME=Alex
POLL_INTERVAL_MINUTES=120
MAX_EMAILS_PER_BATCH=50
DELAY_BETWEEN_EMAILS_MS=15000
CSV_SENDER_EMAIL=
```

### 3. Generate Gmail App Passwords

You **cannot** use your regular Gmail password. You must use an App Password:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" (if not already enabled)
3. Go to "App passwords" (appears after 2FA is enabled)
4. Select "Mail" and "Windows Computer" (or your device)
5. Google will generate a 16-character password like `xxxx-xxxx-xxxx-xxxx`
6. Use this in `GMAIL_APP_PASSWORD`, `SMTP_APP_PASSWORD`, and `EMAIL_PASSWORD` (can be the same account or different)

## Running

### Development Mode

```bash
npx ts-node src/index.ts
```

### Compiled Mode

```bash
npm run build
npm start
```

### Test Mode (with local CSV)

Test the email generation pipeline without connecting to Gmail:

```bash
npx ts-node src/index.ts --test-csv=/path/to/test.csv
```

This will parse the CSV and generate a sample email for the first user without sending anything.

## Project Structure

```
email-outreach/
├── src/
│   ├── index.ts                 # Main entry + cron scheduler
│   ├── config/
│   │   └── env.ts               # Environment config validation
│   ├── gmail/
│   │   └── inboxReader.ts       # IMAP client for Gmail
│   ├── parser/
│   │   └── csvParser.ts         # CSV parsing with validation
│   ├── ai/
│   │   └── emailGenerator.ts    # Claude API integration
│   ├── sender/
│   │   └── gmailSender.ts       # Gmail SMTP sender
│   ├── db/
│   │   └── store.ts             # SQLite database
│   └── utils/
│       └── logger.ts            # Console + file logging
├── data/
│   ├── outreach.db              # SQLite database (auto-created)
│   ├── app.log                  # Application logs (auto-created)
│   └── processed/               # CSV backups
├── .env                         # Environment variables (create from .env.example)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

### Pipeline Flow

```
┌─────────────────┐
│  Check Gmail    │
│  for new CSV    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse CSV &    │
│  validate rows  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Filter out     │
│  already sent   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  For each user: │
│  - Analyze      │
│    prompts      │
│  - Call Claude  │
│    API          │
│  - Send email   │
│  - Log to DB    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Rate limit     │
│  between sends  │
└─────────────────┘
```

## Anti-Spam Implementation

This application follows best practices to avoid spam folders and deliverability issues:

### ✅ Built-In Safeguards

1. **Gmail App Password Authentication** – Authenticated sender (not open relay)
2. **Plain Text Only** – No HTML reduces spam score significantly
3. **Rate Limiting** – 15-second delay between emails by default
4. **Batch Capping** – Max 50 emails per run to avoid bursts
5. **Deduplication** – SQLite prevents emailing same person twice
6. **Unsubscribe Footer** – Every email includes unsubscribe mechanism
7. **List-Unsubscribe Header** – Helps email clients detect mailing list
8. **Precedence Header** – Marks as bulk mail
9. **Personalized Subjects** – Claude generates unique subject lines
10. **Claude Prompt Optimization** – System prompt forbids spam trigger words ("limited time", "exclusive", "act now", etc.)
11. **Real Reply-To Address** – Replies go to your address, not a blackhole

### ⚠️ Manual Configuration Required

You **must** set up SPF, DKIM, and DMARC for your domain for best results:

#### SPF (Sender Policy Framework)

Add to your domain's DNS records:

```
TXT: v=spf1 include:sendgrid.net ~all
```

(Replace with your email provider's SPF record)

#### DKIM (DomainKeys Identified Mail)

Generate DKIM keys through your email provider and add to DNS.

#### DMARC (Domain-based Message Authentication)

Add to your domain's DNS:

```
TXT: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

### 🔥 Warmup Strategy

For best results with cold outreach:

1. **Start small** – Send 5-10 emails per day for the first 2 weeks
2. **Gradually increase** – Ramp up to 20-30/day, then full batches
3. **Monitor delivery** – Check Gmail's Sent folder for bounces
4. **Adjust content** – If emails hit spam, review Claude's tone in system prompt

Warmup prevents ISPs from flagging your sender as spam due to sudden volume.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GMAIL_USER` | Yes | | Gmail account to read CSV emails from |
| `GMAIL_APP_PASSWORD` | Yes | | App password for GMAIL_USER |
| `SMTP_USER` | Yes | | Gmail account to use for SMTP operations |
| `SMTP_APP_PASSWORD` | Yes | | App password for SMTP_USER |
| `EMAIL_SERVICE` | Yes | gmail | Email service provider (gmail, outlook, etc.) |
| `EMAIL_USER` | Yes | | Email account to send outreach emails from |
| `EMAIL_PASSWORD` | Yes | | App password for EMAIL_USER |
| `LLM_API_KEY` | Yes | | API key for LLM service |
| `BRAND_NAME` | Yes | | Your brand/product name |
| `BRAND_URL` | Yes | | Your website URL |
| `SENDER_NAME` | Yes | | Name to display in From header |
| `POLL_INTERVAL_MINUTES` | No | 120 | How often to check Gmail for new CSVs |
| `MAX_EMAILS_PER_BATCH` | No | 50 | Max emails to send per run |
| `DELAY_BETWEEN_EMAILS_MS` | No | 15000 | Milliseconds to wait between sends |
| `CSV_SENDER_EMAIL` | No | | Optional: only process CSVs from this email |

## Logging

All events are logged to:
- **Console** – Real-time output while running
- **`data/app.log`** – Persistent file log with timestamps

Check the log file to debug issues or review sent emails.

## Database

SQLite database at `data/outreach.db` tracks:
- Email address (unique)
- Recipient name
- Email subject sent
- Timestamp
- Status (always "sent" currently)

Query recent sent emails:

```bash
sqlite3 data/outreach.db "SELECT email, name, sent_at FROM sent_emails ORDER BY sent_at DESC LIMIT 10;"
```

## Troubleshooting

### "Missing required environment variable"

Make sure you've copied `.env.example` to `.env` and filled in all required fields.

### "IMAP authentication failed"

Verify you're using an **App Password**, not your regular Gmail password. See [Gmail App Password Setup](#3-generate-gmail-app-passwords).

### "Failed to send email"

Check:
1. SMTP credentials are correct
2. Less secure apps access is enabled (if using regular password instead of App Password)
3. Gmail isn't blocking the connection from your IP

### "No CSV files found"

Emails may not have been received or may not contain `.csv` attachments. Check:
1. Email was sent to `GMAIL_USER`
2. Email has a `.csv` file attached
3. If `CSV_SENDER_EMAIL` is set, email is from that sender
4. Check `data/app.log` for details

### "LLM API errors"

Verify your `LLM_API_KEY` is valid and has API access.

## License

MIT

## Support

For issues or questions, open an issue on GitHub or check the logs in `data/app.log`.
