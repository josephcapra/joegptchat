#!/bin/bash
# Simple deploy script for JoeGPT

echo "🚀 Starting deploy..."

# Step 1: Add all changes
git add .

# Step 2: Commit (use timestamp if no message given)
if [ -z "$1" ]
then
  COMMIT_MSG="Auto-deploy on $(date)"
else
  COMMIT_MSG=$1
fi
git commit -m "$COMMIT_MSG"

# Step 3: Rebase with remote main
echo "🔄 Pulling latest changes with rebase..."
git pull origin main --rebase

# Step 4: Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push origin main

echo "✅ Deploy complete! Vercel will auto-build."

