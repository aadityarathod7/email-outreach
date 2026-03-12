# Email Outreach - Quick Reference Card

## Your LLM API is Already Configured ✅

```
LLM_API_KEY=ca0bb886f508c5b7ebd83ca5bee3e27f19263b33b665a3eee1b203c90e37347b
Endpoint: https://aiplatform.dev51.cbf.dev.paypalinc.com/cosmosai/llm/v1
Model: gpt-4o
SDK: OpenAI (v4.104.0)
```

## Essential Commands

```bash
# 1. INSTALL
npm install

# 2. TEST (no emails sent)
npx ts-node src/index.ts --test-csv=data/test.csv

# 3. RUN
npx ts-node src/index.ts

# BUILD FOR PRODUCTION
npm run build
npm start

# CHECK LOGS
tail -f data/app.log

# VIEW SENT EMAILS
sqlite3 data/outreach.db "SELECT email, name, sent_at FROM sent_emails ORDER BY sent_at DESC LIMIT 10;"
```

## Environment Variables Required

```env
# Gmail IMAP (read CSVs)
GMAIL_USER=                    ← Your Gmail address
GMAIL_APP_PASSWORD=            ← Gmail app password

# Email SMTP (send emails)
EMAIL_SERVICE=gmail            ← email provider
EMAIL_USER=                    ← Your sending email
EMAIL_PASSWORD=                ← Email app password

# LLM API (pre-filled!)
LLM_API_KEY=ca0bb886f508c5b7ebd83ca5bee3e27f19263b33b665a3eee1b203c90e37347b

# Brand
BRAND_NAME=YourBrand           ← Your product/brand
BRAND_URL=https://yourbrand.com  ← Your website
SENDER_NAME=YourName           ← Your name

# Optional
POLL_INTERVAL_MINUTES=120      ← Check Gmail every N minutes
MAX_EMAILS_PER_BATCH=50        ← Max emails per run
DELAY_BETWEEN_EMAILS_MS=15000  ← Delay between sends (ms)
CSV_SENDER_EMAIL=              ← Optional: filter by sender
```

## CSV Format

```csv
email,name,plan,totalImages,images.0,images.1,images.2,images.3,images.4
john@example.com,John,free,12,"prompt1","prompt2","prompt3","",""
```

Required columns: `email`, `name`, `plan`, `totalImages`
Optional columns: `images.0` through `images.4` (image generation prompts)

## File Structure

```
src/
├── index.ts                - Entry point + cron
├── config/env.ts           - Config validation
├── ai/llmService.ts        - Your LLM API ⭐
├── sender/emailSender.ts   - Email sending
├── gmail/inboxReader.ts    - Gmail IMAP
├── parser/csvParser.ts     - CSV parsing
├── db/store.ts             - SQLite DB
└── utils/logger.ts         - Logging

data/
├── outreach.db             - SQLite database (auto-created)
├── app.log                 - Application log (auto-created)
└── processed/              - CSV backups (auto-created)
```

## Database Queries

```bash
# See all sent emails
sqlite3 data/outreach.db "SELECT * FROM sent_emails;"

# Count sent emails
sqlite3 data/outreach.db "SELECT COUNT(*) FROM sent_emails;"

# Find specific email
sqlite3 data/outreach.db "SELECT * FROM sent_emails WHERE email='john@example.com';"

# Recent 10 sends
sqlite3 data/outreach.db "SELECT email, name, sent_at FROM sent_emails ORDER BY sent_at DESC LIMIT 10;"

# Delete if needed (careful!)
sqlite3 data/outreach.db "DELETE FROM sent_emails WHERE email='john@example.com';"
```

## Common Issues

| Problem | Solution |
|---------|----------|
| "Missing required environment variable" | Fill all required vars in `.env` |
| "IMAP authentication failed" | Use Gmail App Password (not regular password) |
| "Email not found" | Check email was sent to GMAIL_USER with CSV attachment |
| "LLM API error" | LLM_API_KEY is pre-set, just verify email credentials |
| "Email sending failed" | Verify EMAIL_USER and EMAIL_PASSWORD are correct |

## Debugging

```bash
# View real-time logs
tail -f data/app.log

# Test LLM API manually
npx ts-node src/index.ts --test-csv=data/test.csv

# Check email service
grep -i "error\|warn" data/app.log

# Database schema
sqlite3 data/outreach.db ".schema"

# Test configuration
cat .env | grep -v "^#"
```

## Configuration Adjustment

### To change check frequency:
```env
POLL_INTERVAL_MINUTES=60  # Check every 1 hour
```

### To send fewer emails per batch:
```env
MAX_EMAILS_PER_BATCH=5   # Start with 5 emails
```

### To slow down sending:
```env
DELAY_BETWEEN_EMAILS_MS=30000  # Wait 30 seconds between emails
```

### To filter by sender:
```env
CSV_SENDER_EMAIL=admin@company.com  # Only process CSVs from this address
```

## Workflow

1. **Prepare CSV** with user data and image prompts
2. **Send email** to GMAIL_USER with CSV attachment
3. **App detects** new email (within poll interval)
4. **Parses CSV** and checks for duplicates
5. **Generates emails** using your LLM API
6. **Sends emails** with rate limiting
7. **Logs results** to database and file
8. **Marks email** as read in Gmail

## Code Patterns

### Environment Config
```typescript
import { config } from './config/env';
config.llmApiKey        // Your LLM API key
config.brandName        // Your brand
config.emailUser        // Email account
```

### LLM Integration
```typescript
import { generateEmail } from './ai/llmService';
const email = await generateEmail(user);
// Returns: { subject: string, body: string }
```

### Database
```typescript
import { recordSent, isAlreadySent } from './db/store';
if (!isAlreadySent(user.email)) {
  recordSent(user.email, user.name, subject);
}
```

### Email Sending
```typescript
import { sendEmail } from './sender/emailSender';
const sent = await sendEmail(to, subject, body);
// Returns: boolean
```

### Logging
```typescript
import { logger } from './utils/logger';
logger.log('message');
logger.warn('warning');
logger.error('error');
```

## Performance Tips

1. **Start with small batches**: `MAX_EMAILS_PER_BATCH=5`
2. **Increase rate delay**: `DELAY_BETWEEN_EMAILS_MS=30000` (30 sec)
3. **Monitor delivery**: Check `data/app.log` regularly
4. **Check spam folder**: Verify emails reach inbox
5. **Gradually increase**: After 1 week, increase batch size

## Documentation Map

```
INDEX.md ..................... Overview & guide
├── QUICK_START.md ........... 3-step setup
├── SETUP.md ................. Detailed setup
├── CHECKLIST.md ............. Verification
├── README.md ................ Full docs
├── IMPLEMENTATION_SUMMARY.md  Technical details
└── REFERENCE.md ............. This file
```

## Support Checklist

- [ ] .env updated with email credentials
- [ ] Gmail App Password generated
- [ ] npm install completed
- [ ] Test mode runs without errors
- [ ] Email preview looks good
- [ ] Database created successfully
- [ ] Logs show no errors

---

**Everything is configured and ready. You only need to update email credentials!** 🚀
