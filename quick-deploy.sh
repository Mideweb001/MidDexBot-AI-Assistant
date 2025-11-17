#!/bin/bash

# 🚀 Quick Railway Deployment Script
echo "🚀 MidDexBot Railway Deployment"
echo "================================="

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install first:"
    echo "curl -fsSL https://railway.app/install.sh | sh"
    exit 1
fi

echo "✅ Railway CLI found"

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Check if we're in a Railway project
if railway status &> /dev/null; then
    echo "✅ Existing Railway project detected"
else
    echo "📦 Creating new Railway project..."
    railway init
fi

# Set essential environment variables
echo "⚙️ Setting up environment variables..."
echo ""
echo "🔑 Please enter your Telegram Bot Token (get from @BotFather):"
read -r BOT_TOKEN

if [ -n "$BOT_TOKEN" ]; then
    railway variables set TELEGRAM_BOT_TOKEN="$BOT_TOKEN"
    echo "✅ Bot token set"
else
    echo "❌ Bot token is required!"
    exit 1
fi

# Set production environment
railway variables set NODE_ENV=production
railway variables set PORT=3000

echo ""
echo "🤖 Optional: OpenAI API Key (for AI features, press Enter to skip):"
read -r OPENAI_KEY
if [ -n "$OPENAI_KEY" ]; then
    railway variables set OPENAI_API_KEY="$OPENAI_KEY"
    echo "✅ OpenAI key set"
fi

echo ""
echo "📺 Optional: YouTube API Key (for course features, press Enter to skip):"
read -r YOUTUBE_KEY
if [ -n "$YOUTUBE_KEY" ]; then
    railway variables set YOUTUBE_API_KEY="$YOUTUBE_KEY"
    echo "✅ YouTube key set"
fi

# Deploy the application
echo ""
echo "🚀 Deploying to Railway..."
railway up --detach

# Wait a moment for deployment
echo "⏳ Waiting for deployment to complete..."
sleep 10

# Get the domain
echo "🔗 Getting your app URL..."
DOMAIN=$(railway domain 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)

if [ -n "$DOMAIN" ]; then
    echo "✅ Your bot is deployed at: $DOMAIN"
    
    # Set webhook URL
    railway variables set WEBHOOK_URL="$DOMAIN"
    echo "✅ Webhook URL configured"
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo "======================="
    echo "🔗 Bot URL: $DOMAIN"
    echo "🏥 Health Check: $DOMAIN/health"
    echo "📊 Railway Dashboard: https://railway.app/dashboard"
    echo ""
    echo "🧪 Test your bot:"
    echo "1. Find your bot on Telegram"
    echo "2. Send /start command"
    echo "3. Try /menu to see all features"
    echo ""
    echo "📝 To check logs: railway logs"
    echo "📊 To check status: railway status"
    
else
    echo "⚠️ Could not get domain automatically."
    echo "Please check Railway dashboard for your app URL"
    echo "Then set WEBHOOK_URL manually: railway variables set WEBHOOK_URL=your-url"
fi

echo ""
echo "✅ Your MidDexBot is now live! 🎊"