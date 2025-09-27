#!/bin/bash

echo "🔄 Starting robust development server restart..."

echo "1️⃣ Killing all existing development processes..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

echo "2️⃣ Waiting for processes to terminate..."
sleep 3

echo "3️⃣ Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf /tmp/next-*

echo "4️⃣ Starting fresh development server on port 3000..."
PORT=3000 npm run dev

echo "✅ Development server should be running at http://localhost:3000"