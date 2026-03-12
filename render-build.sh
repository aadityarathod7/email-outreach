#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm install --prefer-offline --no-audit 2>&1

echo "🔨 Building..."
npm run build

echo "✅ Build complete!"
