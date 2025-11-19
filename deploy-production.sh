#!/bin/bash

# 🚀 MidDexBot Production Deployment Script
# This script helps you deploy your bot to Railway with Supabase database

set -e  # Exit on error

echo "🚀 MidDexBot Production Deployment"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_warning "Railway CLI not found. Installing..."
    npm install -g @railway/cli
    print_success "Railway CLI installed"
fi

# Check if user is logged in to Railway
print_info "Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    print_warning "Not logged in to Railway"
    echo ""
    print_info "Please login to Railway..."
    railway login
    print_success "Logged in to Railway"
else
    RAILWAY_USER=$(railway whoami)
    print_success "Already logged in as: $RAILWAY_USER"
fi

echo ""
echo "📋 Pre-deployment Checklist"
echo "======================================"

# Check for required environment variables
print_info "Checking required environment variables..."

# Ask user for configuration
echo ""
read -p "Have you created a Supabase project? (y/n): " has_supabase

if [ "$has_supabase" != "y" ]; then
    print_warning "Please create a Supabase project first:"
    echo "  1. Go to https://supabase.com"
    echo "  2. Click 'Start your project'"
    echo "  3. Create a new project"
    echo "  4. Copy your DATABASE_URL from Settings → Database"
    echo ""
    exit 1
fi

echo ""
read -p "Enter your Supabase DATABASE_URL: " database_url

if [ -z "$database_url" ]; then
    print_error "DATABASE_URL is required!"
    exit 1
fi

print_success "DATABASE_URL configured"

echo ""
read -p "Enter your Telegram Bot Token (from @BotFather): " bot_token

if [ -z "$bot_token" ]; then
    print_error "TELEGRAM_BOT_TOKEN is required!"
    exit 1
fi

print_success "Bot token configured"

echo ""
read -p "Enter your OpenAI API Key (optional, press enter to skip): " openai_key

# Initialize Railway project if not already done
echo ""
print_info "Initializing Railway project..."

if [ ! -f ".railway" ]; then
    railway init
    print_success "Railway project initialized"
else
    print_success "Railway project already initialized"
fi

# Link to project
print_info "Linking to Railway project..."
railway link

# Set environment variables
echo ""
print_info "Setting environment variables..."

railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set TELEGRAM_BOT_TOKEN="$bot_token"
railway variables set DATABASE_URL="$database_url"

if [ ! -z "$openai_key" ]; then
    railway variables set OPENAI_API_KEY="$openai_key"
fi

print_success "Environment variables configured"

# Get Railway URL (will be available after first deploy)
echo ""
print_info "Getting Railway deployment URL..."
RAILWAY_URL=$(railway status --json 2>/dev/null | grep -o '"url":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ -z "$RAILWAY_URL" ]; then
    print_warning "Railway URL not yet available (will be set after first deploy)"
    print_info "We'll update WEBHOOK_URL after deployment"
else
    print_success "Railway URL: $RAILWAY_URL"
    railway variables set WEBHOOK_URL="$RAILWAY_URL"
fi

# Check git status
echo ""
print_info "Checking git status..."

if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes"
    echo ""
    read -p "Commit and push changes now? (y/n): " should_commit
    
    if [ "$should_commit" = "y" ]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        git push origin main
        print_success "Changes committed and pushed"
    else
        print_warning "Skipping git commit. Make sure to commit before deploying!"
    fi
else
    print_success "Working directory clean"
fi

# Deploy to Railway
echo ""
echo "🚀 Deploying to Railway..."
echo "======================================"

railway up --detach

print_success "Deployment initiated!"

# Wait a moment for deployment to start
echo ""
print_info "Waiting for deployment to complete..."
sleep 5

# Get the deployment URL again
RAILWAY_URL=$(railway status --json 2>/dev/null | grep -o '"url":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ ! -z "$RAILWAY_URL" ]; then
    print_success "Bot deployed to: $RAILWAY_URL"
    
    # Update WEBHOOK_URL
    railway variables set WEBHOOK_URL="$RAILWAY_URL"
    print_success "WEBHOOK_URL updated"
    
    # Verify webhook
    echo ""
    print_info "Verifying webhook configuration..."
    sleep 3
    
    WEBHOOK_CHECK=$(curl -s "https://api.telegram.org/bot${bot_token}/getWebhookInfo")
    
    if echo "$WEBHOOK_CHECK" | grep -q "\"ok\":true"; then
        print_success "Webhook verified successfully!"
    else
        print_warning "Webhook verification pending... Check Railway logs"
    fi
    
    # Test health endpoint
    echo ""
    print_info "Testing health endpoint..."
    HEALTH_CHECK=$(curl -s "$RAILWAY_URL/health" || echo "")
    
    if echo "$HEALTH_CHECK" | grep -q "ok"; then
        print_success "Health check passed!"
    else
        print_warning "Health check pending... Bot may still be starting up"
    fi
else
    print_warning "Could not retrieve Railway URL automatically"
    print_info "Please check Railway dashboard for deployment status"
fi

# Show logs
echo ""
read -p "View deployment logs? (y/n): " show_logs

if [ "$show_logs" = "y" ]; then
    echo ""
    print_info "Showing Railway logs (Ctrl+C to exit)..."
    railway logs --follow
fi

# Deployment summary
echo ""
echo "🎉 Deployment Complete!"
echo "======================================"
print_success "Your bot is now deployed to production!"
echo ""
echo "📊 Next Steps:"
echo "  1. Check Railway dashboard: https://railway.app/dashboard"
echo "  2. Test your bot in Telegram"
echo "  3. Monitor logs with: railway logs --follow"
echo ""
echo "🔗 Useful Links:"
echo "  • Railway Dashboard: https://railway.app/dashboard"
echo "  • Supabase Dashboard: https://supabase.com/dashboard"
echo "  • Health Check: $RAILWAY_URL/health"
echo "  • Bot Webhook: $RAILWAY_URL/webhook"
echo ""
echo "💡 Useful Commands:"
echo "  • View logs: railway logs --follow"
echo "  • Restart bot: railway restart"
echo "  • Check status: railway status"
echo "  • Update env vars: railway variables set KEY=value"
echo ""
print_success "Happy botting! 🤖"
