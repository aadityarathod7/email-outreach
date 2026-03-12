# Email Outreach - Setup Checklist

Complete these steps to get your email outreach automation running.

## Pre-Setup ✅

- [x] Project created with all source files
- [x] TypeScript configured with strict mode
- [x] LLM API key pre-filled in `.env`
- [x] All dependencies specified in `package.json`

## Setup Checklist

### Phase 1: Installation
- [ ] Run `npm install` 
- [ ] Verify no installation errors
- [ ] Check `node_modules/` created

### Phase 2: Gmail App Password
- [ ] Go to [Google Account Security](https://myaccount.google.com/security)
- [ ] Enable 2-Step Verification (if needed)
- [ ] Generate App Password for "Mail"
- [ ] Copy the 16-character password

### Phase 3: Configure Environment (`.env`)

#### Email Reading (IMAP)
- [ ] Set `GMAIL_USER` to your Gmail address
- [ ] Set `GMAIL_APP_PASSWORD` to your app password

#### Email Sending (SMTP)
- [ ] Set `SMTP_USER` to your Gmail address
- [ ] Set `SMTP_APP_PASSWORD` to your app password
- [ ] Set `EMAIL_SERVICE` to "gmail" (or your provider)
- [ ] Set `EMAIL_USER` to your email address
- [ ] Set `EMAIL_PASSWORD` to your app password

#### Brand Configuration
- [ ] Set `BRAND_NAME` to your product/brand name
- [ ] Set `BRAND_URL` to your website
- [ ] Set `SENDER_NAME` to your name

#### Optional Settings
- [ ] Adjust `POLL_INTERVAL_MINUTES` (default: 120)
- [ ] Adjust `MAX_EMAILS_PER_BATCH` (default: 50)
- [ ] Adjust `DELAY_BETWEEN_EMAILS_MS` (default: 15000)
- [ ] Set `CSV_SENDER_EMAIL` if you want to filter by sender

### Phase 4: Test Configuration

#### Quick Test (No Emails Sent)
- [ ] Create `data/test.csv` with sample data
- [ ] Run: `npx ts-node src/index.ts --test-csv=data/test.csv`
- [ ] Verify email generation works
- [ ] Check generated subject and body look good

#### Database Test
- [ ] Run: `sqlite3 data/outreach.db ".tables"`
- [ ] Verify `sent_emails` table exists
- [ ] Check table has correct columns

#### Logging Test
- [ ] Verify `data/app.log` created
- [ ] Check log has timestamp and messages
- [ ] Look for any error messages

### Phase 5: Production Setup

#### Build Configuration
- [ ] Run: `npm run build`
- [ ] Verify `dist/` directory created
- [ ] Check TypeScript compilation successful

#### Test Production Build
- [ ] Run: `npm start`
- [ ] Monitor logs for 1-2 minutes
- [ ] Verify no errors
- [ ] Stop with `Ctrl+C`

#### Cron Schedule
- [ ] Decide on `POLL_INTERVAL_MINUTES`
- [ ] Document when checks will run
- [ ] Set up monitoring/alerts if needed

### Phase 6: Verification

#### Code Check
- [ ] All TypeScript files compile
- [ ] No `any` types used
- [ ] All error handling in place
- [ ] Logging at appropriate levels

#### Database Check
- [ ] SQLite file created at `data/outreach.db`
- [ ] Schema correct with `sent_emails` table
- [ ] UNIQUE constraint on email field

#### Configuration Check
- [ ] All required env vars present
- [ ] No secrets in version control (`.env` not committed)
- [ ] `.gitignore` includes `data/`, `.env`, `*.db`

#### Email Check
- [ ] Can connect to Gmail IMAP
- [ ] Can authenticate with App Password
- [ ] Can send test email via SMTP
- [ ] Email arrives in recipient inbox
- [ ] Plain text format (no HTML)
- [ ] Unsubscribe footer included

#### LLM Integration Check
- [ ] LLM API responds correctly
- [ ] Email subject generated properly
- [ ] Email body formatted correctly
- [ ] JSON parsing successful
- [ ] Retry logic works if needed

### Phase 7: Monitoring

#### Logs
- [ ] Check `data/app.log` regularly
- [ ] Monitor for errors or warnings
- [ ] Verify successful sends logged
- [ ] Track API response times

#### Database
- [ ] Query sent emails regularly
- [ ] Monitor deduplication working
- [ ] Check for any failures

#### Email Delivery
- [ ] Monitor recipient inbox
- [ ] Check spam folder
- [ ] Verify unsubscribe mechanism works
- [ ] Monitor bounce rate (should be low)

### Phase 8: Optimization (Optional)

#### Email Content
- [ ] Review generated emails
- [ ] Adjust LLM prompt if needed
- [ ] Fine-tune brand voice
- [ ] Update system prompt for better tone

#### Performance
- [ ] Adjust rate limiting if needed
- [ ] Monitor API response times
- [ ] Optimize batch size
- [ ] Consider resource usage

#### Deliverability
- [ ] Set up SPF record (optional)
- [ ] Set up DKIM (optional)
- [ ] Set up DMARC (optional)
- [ ] Monitor spam score

## Status Tracking

| Phase | Status | Date |
|-------|--------|------|
| Installation | - | |
| Configuration | - | |
| Testing | - | |
| Building | - | |
| Verification | - | |
| Monitoring | - | |

## Quick Commands

```bash
# Install
npm install

# Test mode (no emails sent)
npx ts-node src/index.ts --test-csv=data/test.csv

# Development mode
npx ts-node src/index.ts

# Build for production
npm run build

# Run production build
npm start

# Check logs
tail -f data/app.log

# View sent emails
sqlite3 data/outreach.db "SELECT * FROM sent_emails ORDER BY sent_at DESC LIMIT 10;"

# Check configuration
cat .env
```

## Support

- 📖 See `README.md` for detailed documentation
- 🚀 See `SETUP.md` for setup instructions
- ⚡ See `QUICK_START.md` for quick reference
- 📋 See `IMPLEMENTATION_SUMMARY.md` for technical details

---

**Once all items are checked, your email outreach system is ready!** ✅
