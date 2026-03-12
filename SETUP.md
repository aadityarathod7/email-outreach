# Email Outreach - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd email-outreach
npm install
```

### 2. Configure Environment

The `.env` file is already pre-filled with your LLM_API_KEY. Update the following:

```env
# Gmail Account (for reading CSV emails via IMAP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Email Sending Account (for SMTP)
SMTP_USER=your-email@gmail.com
SMTP_APP_PASSWORD=your-app-password

# Email Service Config
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Your Brand Details
BRAND_NAME=Your AI Tool
BRAND_URL=https://yourbrand.com
SENDER_NAME=Your Name
```

**Note:** Your LLM API Key is already set:
```
LLM_API_KEY=ca0bb886f508c5b7ebd83ca5bee3e27f19263b33b665a3eee1b203c90e37347b
```

### 3. Generate Gmail App Password

Since you're using your personal Gmail account, you need an App Password (not your regular password):

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification (if not already enabled)
3. Find "App passwords" → Select "Mail" and "Windows Computer"
4. Copy the 16-character password provided
5. Use it for `GMAIL_APP_PASSWORD`, `SMTP_APP_PASSWORD`, and `EMAIL_PASSWORD`

### 4. Test Configuration

Create a test CSV file at `data/test.csv`:

```csv
email,name,plan,totalImages,images.0,images.1,images.2,images.3,images.4
john@example.com,John,free,12,"sunset over mountains","cyberpunk samurai","cute cat","",""
jane@example.com,Jane,pro,45,"abstract geometric patterns","portrait photography","nature landscape","anime style","fantasy art"
```

Run in test mode:

```bash
npx ts-node src/index.ts --test-csv=data/test.csv
```

This generates a sample email without connecting to Gmail or sending anything.

### 5. Run in Development

```bash
npx ts-node src/index.ts
```

The app will:
- Run immediately on startup
- Check for new CSVs in Gmail every 2 hours
- Generate personalized emails using your LLM API
- Send emails with rate limiting (15s between each)
- Log everything to console and `data/app.log`

### 6. Build for Production

```bash
npm run build
npm start
```

## Key Implementation Details

### LLM Integration
- Uses your custom LLM API endpoint
- Generates personalized emails with creative interest analysis
- Implements retry logic for failed generations

### Email Service
- Uses nodemailer with Gmail SMTP
- Configurable email service (gmail, outlook, etc.)
- Plain text emails for better deliverability
- Unsubscribe headers and footers

### Anti-Spam Features
- ✅ Rate limiting (15s default between emails)
- ✅ Batch capping (50 emails per run)
- ✅ Deduplication (SQLite prevents duplicate sends)
- ✅ Plain text only (no HTML)
- ✅ Proper unsubscribe mechanism
- ✅ List-Unsubscribe headers

### Database
SQLite tracks all sent emails at `data/outreach.db`:

```bash
# View recently sent emails
sqlite3 data/outreach.db "SELECT email, name, sent_at FROM sent_emails ORDER BY sent_at DESC LIMIT 10;"

# Check if email was already sent
sqlite3 data/outreach.db "SELECT * FROM sent_emails WHERE email='john@example.com';"
```

## Troubleshooting

### Missing Required Environment Variables
```
Error: Missing required environment variable: EMAIL_USER
```
Make sure all required vars in `.env` are filled in.

### IMAP Connection Failed
```
Error: IMAP authentication failed
```
Verify you're using an **App Password**, not your regular Gmail password.

### Email Sending Failed
Check that:
1. `EMAIL_USER` and `EMAIL_PASSWORD` are correct
2. The account has IMAP/SMTP access enabled
3. Less Secure App Access is enabled (if needed)

### LLM API Error
```
Error: Failed to generate email for user@example.com
```
Verify your `LLM_API_KEY` is valid and has API access.

## File Structure

```
email-outreach/
├── src/
│   ├── config/env.ts              # Environment validation
│   ├── gmail/inboxReader.ts       # Gmail IMAP reader
│   ├── parser/csvParser.ts        # CSV parsing
│   ├── ai/llmService.ts           # LLM API integration
│   ├── sender/emailSender.ts      # Email sender
│   ├── db/store.ts                # SQLite database
│   ├── utils/logger.ts            # Logging
│   └── index.ts                   # Main entry point
├── data/
│   ├── outreach.db                # SQLite database (auto-created)
│   ├── app.log                    # Application logs
│   └── processed/                 # CSV backups
├── .env                           # Configuration (your LLM key included)
├── package.json
├── tsconfig.json
└── README.md
```

## Next Steps

1. **Set up real Gmail account** – Replace placeholder values with your actual credentials
2. **Test with CSV** – Use test mode to verify email generation works
3. **Configure scheduler** – Adjust `POLL_INTERVAL_MINUTES` as needed (default: 2 hours)
4. **Monitor logs** – Check `data/app.log` for any issues
5. **Run in production** – Build and deploy using `npm run build && npm start`

## Support

Check `data/app.log` for detailed error messages and application logs.
