#!/bin/bash

# Railway Deployment Script for Telegram Bot
echo "🚀 Deploying Telegram Bot to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    echo "Please install Railway CLI first:"
    echo "npm install -g @railway/cli"
    echo "or"
    echo "curl -fsSL https://railway.app/install.sh | sh"
    exit 1
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Create new Railway project (if needed)
echo "📦 Setting up Railway project..."
railway link

# Set environment variables
echo "⚙️ Setting up environment variables..."
echo "Please set these environment variables in Railway dashboard:"
echo ""
echo "TELEGRAM_BOT_TOKEN=your_actual_bot_token"
echo "OPENAI_API_KEY=your_openai_key (optional)"
echo "YOUTUBE_API_KEY=your_youtube_key (optional)"
echo "NODE_ENV=production"
echo "PORT=3000"
echo ""

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment initiated!"
echo "📊 Check deployment status: railway status"
echo "🔗 Get your app URL: railway domain"
echo "📱 Set webhook URL in your bot after deployment completes"