# Render Deployment Troubleshooting

## Issue: "npm error Exit handler never called"

This is a known issue with npm on Render. Here are the solutions in order:

### Solution 1: Use Updated Build Command (Recommended)

In Render Dashboard Settings, set Build Command to:

```
npm install --no-cache && npm run build
```

This:
- Skips npm cache (which might be corrupted)
- Uses fresh install from package-lock.json
- Should resolve most issues

### Solution 2: Increase Memory Limit

If build times out or memory issues occur, add environment variables:

In Render Settings → Environment, add:
```
NODE_OPTIONS: --max-old-space-size=2048
NPM_FLAGS: --legacy-peer-deps
```

### Solution 3: Clear Render Cache

1. Go to your service in Render dashboard
2. Click **Settings** → **Environment** tab
3. Look for any cached environment variables
4. Try **Manual Deploy** with "Clear build cache" option if available

### Solution 4: Use Specific npm Version

Render sometimes has npm compatibility issues. Force a specific npm version:

```
npm install -g npm@10.8.0 && npm install --no-cache && npm run build
```

### Solution 5: Switch to Yarn

If npm continues to fail, switch to yarn:

1. Delete `package-lock.json`
2. Run locally: `yarn install` (creates yarn.lock)
3. Commit yarn.lock to GitHub
4. Update Render Build Command to:
   ```
   yarn install --frozen-lockfile && yarn run build
   ```

### Solution 6: Use Pre-built Docker Image

If npm/node issues persist, use Docker:

1. Create `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

2. Push to GitHub
3. In Render, select "Docker" instead of "Node"

---

## Other Common Issues

### Build Timeout (>45 minutes)

Render has a 45-minute build timeout. If exceeded:

1. Increase machine type to "Starter" or higher (paid plans)
2. Optimize dependencies (remove unused packages)
3. Pre-build assets locally and commit `dist/` folder

### "Cannot find module 'typescript'"

This means npm install failed silently. Check:

1. `node_modules/` folder exists (should be ~1GB)
2. Run `npm install` locally to verify it works
3. Check package.json for typos
4. Try clearing cache with Solution 3

### Database Errors at Runtime

SQLite database resets on Render free tier. This is expected.

To persist data:
1. Upgrade to PostgreSQL (Render offers free tier)
2. Or use Render Disk (paid tier feature)

---

## Debug Tips

### View Full Build Logs

1. Go to service in Render dashboard
2. Click **Logs** tab
3. Scroll through build output
4. Look for first error message

### Test Build Locally

Before pushing to Render, test:

```bash
npm install --no-cache
npm run build
npm start
```

If this fails locally, fix before pushing.

### Check Environment Variables

In Render Settings → Environment:
- Make sure all required env vars are set
- Especially: OPENAI_API_KEY, GMAIL_USER, GMAIL_APP_PASSWORD
- No secrets in code

---

## Still Having Issues?

If none of these work:

1. **Try the Docker approach** (most reliable)
2. **Check Render status page** for ongoing issues
3. **Upgrade to Starter plan** (better resources)
4. **Ask Render support** with full build logs

---

## Quick Reference Commands

```bash
# Test build locally
npm install --no-cache && npm run build && npm start

# Clear all dependencies
rm -rf node_modules package-lock.json
npm install

# Install without optional packages
npm install --no-optional --legacy-peer-deps

# Build only (after install)
npm run build
```

---

**Last Updated**: March 12, 2026
**Tested on**: Node 20.20.1, npm 10.2.x, Render Free Tier
