#!/bin/bash
set -e

echo "Starting Render build..."

echo "Step 1: Installing dependencies..."
npm install --legacy-peer-deps || npm install

echo "Step 2: Building backend (TypeScript)..."
npx tsc

echo "Step 3: Building frontend (Vite + React)..."
npx vite build --config vite.config.ts

echo "✅ Build complete!"
