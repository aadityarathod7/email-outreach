# 🚀 Web UI - Quick Start

## Installation (First Time Only)

```bash
cd /Users/sjat/Desktop/email-outreach
npm install
```

## Start Development

```bash
npm run dev
```

This starts BOTH servers:
- **Backend API**: http://localhost:3000
- **Frontend Web UI**: http://localhost:5173

## Open in Browser

Go to: **http://localhost:5173**

---

## Dashboard Overview

### Pages Available

| Page | Icon | What It Does |
|------|------|------------|
| Dashboard | 📊 | View stats, charts, recent emails |
| Send Emails | 📧 | Upload CSV, preview, and send emails |
| Preview | 👁️ | Generate single email preview |
| History | 📜 | View all sent emails |
| Settings | ⚙️ | Configure brand, rate limits, intervals |

---

## Common Tasks

### Send Email Campaign
1. Click **Send Emails** in sidebar
2. Upload your CSV file
3. Click **Preview** to see dry-run results
4. Click **Send** to actually send
5. View results in table

### View Dashboard
1. Click **Dashboard** in sidebar
2. See stats: Total sent, Last 24h, Last 7d, Last 30d
3. See chart of sends over time
4. View recent sent emails

### Update Settings
1. Click **Settings** in sidebar
2. Edit brand name, URL, sender name
3. Adjust rate limits, poll interval, batch size
4. Click **Save Settings**

### Check Sent Emails
1. Click **History** in sidebar
2. Search by email or name
3. View all sent emails with timestamps

---

## Development Commands

```bash
# Install dependencies
npm install

# Run both backend and frontend
npm run dev

# Run only backend (port 3000)
npm run dev:backend

# Run only frontend (port 5173)
npm run dev:frontend

# Build for production
npm run build

# Run production build
npm start

# Preview production build
npm run preview
```

---

## Configuration

All settings are in `.env` file:

```env
BRAND_NAME=YourAITool
BRAND_URL=https://yourtool.com
SENDER_NAME=Alex
POLL_INTERVAL_MINUTES=120
MAX_EMAILS_PER_BATCH=50
DELAY_BETWEEN_EMAILS_MS=15000
```

You can also update these in the Settings page of the dashboard!

---

## Features

✅ **Dashboard** - Real-time statistics and charts
✅ **Email Sender** - Upload CSV, preview, and send emails
✅ **Email Preview** - Generate individual email previews
✅ **History** - View all sent emails with search
✅ **Configuration** - Update settings without editing `.env`
✅ **Rate Limiting** - Built-in delays between emails
✅ **LLM Integration** - Uses your custom LLM API
✅ **SQLite Tracking** - Prevents duplicate sends
✅ **Responsive Design** - Works on desktop and mobile

---

## Troubleshooting

### "Cannot GET /"
- Make sure you're accessing: `http://localhost:5173`
- Not `http://localhost:3000` (that's the API)

### API calls failing
- Make sure backend is running: `npm run dev:backend`
- Check that both servers are started: `npm run dev`

### Port already in use
```bash
# Find and kill process on port
lsof -ti:5173 | xargs kill -9
```

### Changes not showing
- Hard refresh browser: `Ctrl+Shift+R` or `Cmd+Shift+R`
- Clear cache in DevTools
- Restart dev servers

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm run dev`
3. ✅ Open browser: `http://localhost:5173`
4. ✅ Upload CSV and send emails
5. ✅ View dashboard and history
6. ✅ Update settings as needed

---

## That's It! 🎉

Your web dashboard is ready to use. No CLI needed—everything is managed through the beautiful web interface!

Happy emailing! 📧
