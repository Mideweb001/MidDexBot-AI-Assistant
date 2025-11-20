#!/bin/bash

# 🔍 Production Verification Script
# Checks if your bot is properly running in production

echo "🔍 MidDexBot Production Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configuration
RAILWAY_URL="https://telegrambot-production-5661.up.railway.app"
BOT_TOKEN="8500626829:AAFgJNcO3FDFWmDNYHDJpaOmXOdb5jplDhU"

echo "🌐 Testing Production Endpoint..."
echo ""

# Test 1: Health Check
echo "1️⃣ Health Check:"
HEALTH_RESPONSE=$(curl -s "$RAILWAY_URL/health")

if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo "   ✅ Server is healthy"
    
    if echo "$HEALTH_RESPONSE" | grep -q '"mode":"production"'; then
        echo "   ✅ Running in production mode"
    else
        echo "   ⚠️  NOT in production mode (still development)"
        echo "   Fix: railway variables --set \"NODE_ENV=production\""
    fi
else
    echo "   ❌ Health check failed"
    echo "   Response: $HEALTH_RESPONSE"
fi

echo ""

# Test 2: Webhook Status
echo "2️⃣ Telegram Webhook:"
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")

if echo "$WEBHOOK_INFO" | grep -q "$RAILWAY_URL"; then
    echo "   ✅ Webhook is set correctly"
    
    PENDING=$(echo "$WEBHOOK_INFO" | grep -oP '"pending_update_count":\K\d+')
    echo "   📊 Pending updates: $PENDING"
    
    if echo "$WEBHOOK_INFO" | grep -q '"last_error_date"'; then
        echo "   ⚠️  Webhook has errors"
        ERROR_MSG=$(echo "$WEBHOOK_INFO" | grep -oP '"last_error_message":"\K[^"]+')
        echo "   Error: $ERROR_MSG"
    else
        echo "   ✅ No webhook errors"
    fi
else
    echo "   ❌ Webhook not set or incorrect"
    echo "   Expected: $RAILWAY_URL"
    echo "   Fix: railway variables --set \"WEBHOOK_URL=$RAILWAY_URL\""
fi

echo ""

# Test 3: Database Connection
echo "3️⃣ Database Status:"
if railway logs --tail 50 2>/dev/null | grep -q "PostgreSQL"; then
    echo "   ✅ Using PostgreSQL database"
elif railway logs --tail 50 2>/dev/null | grep -q "SQLite"; then
    echo "   ⚠️  Still using SQLite (development mode)"
    echo "   Fix: railway add postgresql"
else
    echo "   ⚠️  Cannot determine database type"
fi

echo ""

# Test 4: Environment Variables
echo "4️⃣ Critical Variables:"
if command -v railway &> /dev/null; then
    VARS=$(railway variables 2>/dev/null)
    
    if echo "$VARS" | grep -q "NODE_ENV"; then
        NODE_ENV=$(echo "$VARS" | grep "NODE_ENV" | cut -d'=' -f2)
        if [ "$NODE_ENV" = "production" ]; then
            echo "   ✅ NODE_ENV=production"
        else
            echo "   ⚠️  NODE_ENV=$NODE_ENV (should be production)"
        fi
    else
        echo "   ❌ NODE_ENV not set"
    fi
    
    [ ! -z "$(echo "$VARS" | grep "DATABASE_URL")" ] && echo "   ✅ DATABASE_URL set" || echo "   ❌ DATABASE_URL not set"
    [ ! -z "$(echo "$VARS" | grep "WEBHOOK_URL")" ] && echo "   ✅ WEBHOOK_URL set" || echo "   ❌ WEBHOOK_URL not set"
    [ ! -z "$(echo "$VARS" | grep "TELEGRAM_BOT_TOKEN")" ] && echo "   ✅ TELEGRAM_BOT_TOKEN set" || echo "   ❌ TELEGRAM_BOT_TOKEN not set"
    [ ! -z "$(echo "$VARS" | grep "RAPIDAPI_KEY")" ] && echo "   ✅ RAPIDAPI_KEY set" || echo "   ⚠️  RAPIDAPI_KEY not set"
    [ ! -z "$(echo "$VARS" | grep "AMADEUS_API_KEY")" ] && echo "   ✅ AMADEUS_API_KEY set" || echo "   ⚠️  AMADEUS_API_KEY not set"
else
    echo "   ⚠️  Railway CLI not installed - cannot check variables"
    echo "   Install: npm install -g @railway/cli"
fi

echo ""

# Test 5: Recent Logs
echo "5️⃣ Recent Activity:"
if command -v railway &> /dev/null; then
    echo "   Last 10 log entries:"
    railway logs --tail 10 2>/dev/null | tail -5 | sed 's/^/   /'
else
    echo "   ⚠️  Cannot check logs (Railway CLI not installed)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Overall Status
ALL_GOOD=true

if ! echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    ALL_GOOD=false
fi

if ! echo "$HEALTH_RESPONSE" | grep -q '"mode":"production"'; then
    ALL_GOOD=false
fi

if ! echo "$WEBHOOK_INFO" | grep -q "$RAILWAY_URL"; then
    ALL_GOOD=false
fi

if [ "$ALL_GOOD" = true ]; then
    echo "🎉 Status: PRODUCTION READY"
    echo ""
    echo "Your bot is fully operational:"
    echo "  • Running in production mode ✅"
    echo "  • Webhook configured ✅"
    echo "  • Server healthy ✅"
    echo ""
    echo "Test in Telegram:"
    echo "  /start"
    echo "  /search_hotels London"
    echo "  /search_restaurants Lagos"
    echo ""
else
    echo "⚠️  Status: NEEDS CONFIGURATION"
    echo ""
    echo "Run setup script to fix:"
    echo "  ./setup-production.sh"
    echo ""
    echo "Or manually set variables:"
    echo "  railway variables --set \"NODE_ENV=production\""
    echo "  railway variables --set \"WEBHOOK_URL=$RAILWAY_URL\""
    echo ""
fi

echo "View full logs: railway logs --follow"
echo "Railway dashboard: https://railway.app"
echo ""
