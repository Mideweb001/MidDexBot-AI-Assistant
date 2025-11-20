#!/bin/bash

# 🚀 Railway Production Setup Script
# This script sets up your bot for full production deployment

echo "🚀 MidDexBot Production Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  npm install -g @railway/cli"
    echo "  or"
    echo "  brew install railway"
    echo ""
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway"
    echo ""
    echo "Please run: railway login"
    echo ""
    exit 1
fi

echo "✅ Logged in to Railway"
echo ""

# Check if project is linked
if ! railway status &> /dev/null; then
    echo "❌ Project not linked"
    echo ""
    echo "Please run: railway link"
    echo ""
    exit 1
fi

echo "✅ Project linked"
echo ""

# Step 1: Check if PostgreSQL is added
echo "📊 Step 1: Checking PostgreSQL..."
if railway variables | grep -q "DATABASE_URL"; then
    echo "✅ PostgreSQL already configured!"
else
    echo "⚠️  PostgreSQL not found"
    echo ""
    read -p "Do you want to add PostgreSQL now? (y/n): " add_postgres
    
    if [ "$add_postgres" = "y" ] || [ "$add_postgres" = "Y" ]; then
        echo "🔧 Adding PostgreSQL..."
        railway add postgresql
        echo "✅ PostgreSQL added!"
        echo "⏳ Waiting for database to initialize (10 seconds)..."
        sleep 10
    else
        echo "ℹ️  You can add it later with: railway add postgresql"
    fi
fi

echo ""

# Step 2: Set production variables
echo "⚙️  Step 2: Setting production variables..."

# Set NODE_ENV
railway variables --set "NODE_ENV=production"
echo "✅ NODE_ENV=production"

# Get current Railway URL
echo ""
echo "🌐 Getting your Railway deployment URL..."
RAILWAY_URL=$(railway status 2>&1 | grep -oP 'https://[^\s]+' | head -1)

if [ -z "$RAILWAY_URL" ]; then
    echo "⚠️  Could not auto-detect Railway URL"
    echo ""
    read -p "Enter your Railway URL (e.g., https://telegrambot-production-5661.up.railway.app): " RAILWAY_URL
fi

# Set WEBHOOK_URL
railway variables --set "WEBHOOK_URL=$RAILWAY_URL"
echo "✅ WEBHOOK_URL=$RAILWAY_URL"

echo ""

# Step 3: Verify all critical variables
echo "🔍 Step 3: Verifying critical variables..."

MISSING_VARS=()

if ! railway variables | grep -q "TELEGRAM_BOT_TOKEN"; then
    MISSING_VARS+=("TELEGRAM_BOT_TOKEN")
fi

if ! railway variables | grep -q "RAPIDAPI_KEY"; then
    echo "⚠️  RAPIDAPI_KEY not set (hotel searches won't use external API)"
fi

if ! railway variables | grep -q "AMADEUS_API_KEY"; then
    echo "⚠️  AMADEUS_API_KEY not set (hotel searches won't use external API)"
fi

if ! railway variables | grep -q "OPENAI_API_KEY"; then
    echo "⚠️  OPENAI_API_KEY not set (will use fallback AI)"
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Critical variables missing:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Set them with:"
    echo "  railway variables --set \"VARIABLE_NAME=value\""
    echo ""
    exit 1
fi

echo "✅ All critical variables set!"
echo ""

# Step 4: Show current configuration
echo "📋 Step 4: Current Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
railway variables | grep -E "(NODE_ENV|WEBHOOK_URL|DATABASE_URL|RAPIDAPI_KEY|AMADEUS_API_KEY)" | sed 's/=.*/=***/' || railway variables
echo ""

# Step 5: Deploy
echo "🚀 Step 5: Ready to Deploy!"
echo ""
read -p "Deploy to production now? (y/n): " deploy_now

if [ "$deploy_now" = "y" ] || [ "$deploy_now" = "Y" ]; then
    echo ""
    echo "🚀 Deploying to production..."
    railway up --detach
    
    echo ""
    echo "⏳ Waiting for deployment to complete (30 seconds)..."
    sleep 30
    
    echo ""
    echo "🔍 Checking health..."
    if curl -s "$RAILWAY_URL/health" | grep -q "ok"; then
        echo "✅ Bot is live and healthy!"
    else
        echo "⚠️  Health check inconclusive, checking logs..."
        railway logs --tail 20
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 Deployment Complete!"
    echo ""
    echo "Your bot is now running in production:"
    echo "  URL: $RAILWAY_URL"
    echo "  Mode: production (webhooks)"
    echo "  Database: PostgreSQL"
    echo ""
    echo "Test it:"
    echo "  1. Open Telegram"
    echo "  2. Send /start to your bot"
    echo "  3. Try /search_hotels London"
    echo "  4. Try /search_restaurants Lagos"
    echo ""
    echo "View logs: railway logs --follow"
    echo "Check status: railway status"
    echo ""
else
    echo ""
    echo "ℹ️  No problem! Deploy later with:"
    echo "  railway up"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "📚 Documentation:"
echo "  - PRODUCTION-MIGRATION-GUIDE.md"
echo "  - HOTEL-API-READY.md"
echo "  - RESTAURANT-SEARCH-COMPLETE.md"
echo ""
