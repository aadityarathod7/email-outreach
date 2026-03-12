# Fix Render Build Error - Action Required

The build is failing because Render's **dashboard Build Command setting** is overriding the `render.yaml` file.

## ⚡ Quick Fix (2 steps)

### Step 1: Go to Render Service Settings

1. Open your Render dashboard
2. Click on your **email-outreach** service
3. Go to **Settings** tab

### Step 2: Update Build Command

Find the field labeled **"Build Command"** and change it from:

```
npm install && npm run build
```

To:

```
npm ci && npm run build
```

Then click **"Save"**

## Step 3: Redeploy

1. Click **"Manual Deploy"** button
2. Select latest commit
3. Click **"Deploy"**

Wait 2-5 minutes for build to complete.

---

## Why This Fix Works

- `npm install` can have race conditions on Render's system
- `npm ci` (clean install) respects exact lock file versions
- More reliable for CI/CD environments like Render
- Prevents the "Exit handler never called" npm error

## If Build Still Fails

Try this instead:

```
npm ci --prefer-offline --no-audit && npm run build
```

Or as a last resort:

```
npm install --production=false && npm run build
```

---

Let me know once you've updated the Build Command and I can help monitor the deploy logs!
