#!/bin/bash
set -e

echo "🔨 Building Email Outreach for Render..."

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building backend..."
npm run build:backend

echo "⚛️  Building frontend..."
npm run build:frontend

echo "✅ Build complete!"
