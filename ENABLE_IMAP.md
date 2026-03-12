# How to Enable IMAP Access in Gmail

## Step 1: Go to Gmail Settings

1. Open Gmail: https://mail.google.com
2. Click the **gear icon** ⚙️ in the top right
3. Select **"See all settings"**

---

## Step 2: Go to Forwarding and POP/IMAP Tab

1. Click on the **"Forwarding and POP/IMAP"** tab
2. Look for the IMAP Access section

---

## Step 3: Enable IMAP

Find this section:
```
IMAP Access:
○ Disable IMAP
● Enable IMAP  ← SELECT THIS
```

Make sure **"Enable IMAP"** is selected (radio button filled).

---

## Step 4: Save Changes

Scroll to the bottom and click **"Save Changes"**

---

## Step 5: Verify App Password

Make sure you're using an **App Password**, not your regular Gmail password:

1. Go to https://myaccount.google.com/security
2. Scroll to "How you sign in to Google"
3. Make sure **"2-Step Verification"** is ON
4. Go to **"App passwords"** (appears after 2FA is enabled)
5. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your device)
6. Google will generate a 16-character password like: `xxxx xxxx xxxx xxxx`
7. Copy this and use it in your `.env` file

---

## Step 6: Test IMAP Connection

After enabling, you can test the connection:

```bash
source ~/.zshrc && npx ts-node test_imap_direct.ts
```

---

## Troubleshooting

### Issue: "Less Secure App Access"
If you see this error, Google has blocked IMAP access for security reasons.

**Solution:**
1. Go to https://myaccount.google.com/security
2. Scroll down to "Less secure app access"
3. Toggle it **ON** (temporarily)
4. Try connecting again

### Issue: "App password doesn't work"
- Make sure you copied the entire password **with spaces**
- Check that 2-Step Verification is enabled
- Try generating a new app password

### Issue: Still getting authentication errors
- Clear your browser cache
- Try using Gmail in a different browser
- Wait 5 minutes for changes to propagate

---

## IMAP Settings Summary

For your `.env` file, use these settings:

```env
# Gmail IMAP
GMAIL_USER=aayushi@artnovaai.com
GMAIL_APP_PASSWORD=cosx pvew uugv wtwd

# Gmail SMTP
SMTP_USER=aayushi@artnovaai.com
SMTP_APP_PASSWORD=cosx pvew uugv wtwd

# Email Service
EMAIL_USER=aayushi@artnovaai.com
EMAIL_PASSWORD=cosx pvew uugv wtwd
```

**Note:** Make sure the app password includes the spaces exactly as shown.

---

## Once IMAP is Enabled

You'll be able to:

1. ✅ Automatically monitor Gmail inbox for CSV attachments
2. ✅ Read emails with CSV files
3. ✅ Extract and process CSV data
4. ✅ Track when CSVs were received
5. ✅ Backup CSV files locally

Then run:
```bash
source ~/.zshrc && npx ts-node check_gmail_csv.ts
```

---

## Quick Checklist

- [ ] Go to https://mail.google.com/mail/u/0/#settings/fwdandpop
- [ ] Enable IMAP (radio button selected)
- [ ] Save Changes
- [ ] Go to https://myaccount.google.com/security
- [ ] Verify 2-Step Verification is ON
- [ ] Generate/copy App Password (16 chars with spaces)
- [ ] Paste into `.env` file
- [ ] Test connection with `npx ts-node test_imap_direct.ts`
- [ ] If auth fails, enable "Less Secure App Access"
- [ ] Try again

Once all steps are done, you'll be able to read CSVs from Gmail! ✅
