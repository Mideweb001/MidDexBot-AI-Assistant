#!/bin/bash

# Hotel API Setup Script for Railway
# Run this script to add hotel API keys to production

echo "🏨 Hotel API Configuration Setup"
echo "================================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "Install it: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway"
    echo "Run: railway login"
    exit 1
fi

echo "✅ Logged in to Railway"
echo ""

# Prompt for API choice
echo "Which hotel API do you want to configure?"
echo "1. Booking.com (via RapidAPI) - Recommended"
echo "2. Amadeus Hotel API"
echo "3. Both"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📋 Booking.com API Setup"
        echo "========================"
        echo ""
        echo "Get your RapidAPI key from:"
        echo "https://rapidapi.com/apidojo/api/booking-com"
        echo ""
        read -p "Enter your RapidAPI key: " rapidapi_key
        
        if [ -z "$rapidapi_key" ]; then
            echo "❌ No key entered"
            exit 1
        fi
        
        echo ""
        echo "Setting RAPIDAPI_KEY in Railway..."
        railway variables set RAPIDAPI_KEY="$rapidapi_key"
        
        if [ $? -eq 0 ]; then
            echo "✅ RAPIDAPI_KEY configured successfully!"
        else
            echo "❌ Failed to set variable"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        echo "📋 Amadeus Hotel API Setup"
        echo "==========================="
        echo ""
        echo "Get your credentials from:"
        echo "https://developers.amadeus.com/"
        echo ""
        read -p "Enter your Amadeus API Key: " amadeus_key
        read -p "Enter your Amadeus API Secret: " amadeus_secret
        
        if [ -z "$amadeus_key" ] || [ -z "$amadeus_secret" ]; then
            echo "❌ Missing credentials"
            exit 1
        fi
        
        echo ""
        echo "Setting Amadeus credentials in Railway..."
        railway variables set AMADEUS_API_KEY="$amadeus_key"
        railway variables set AMADEUS_API_SECRET="$amadeus_secret"
        
        if [ $? -eq 0 ]; then
            echo "✅ Amadeus credentials configured successfully!"
        else
            echo "❌ Failed to set variables"
            exit 1
        fi
        ;;
        
    3)
        echo ""
        echo "📋 Both APIs Setup"
        echo "=================="
        echo ""
        
        # RapidAPI
        echo "1️⃣ Booking.com (RapidAPI)"
        echo "Get key from: https://rapidapi.com/apidojo/api/booking-com"
        echo ""
        read -p "Enter your RapidAPI key: " rapidapi_key
        
        # Amadeus
        echo ""
        echo "2️⃣ Amadeus Hotel API"
        echo "Get credentials from: https://developers.amadeus.com/"
        echo ""
        read -p "Enter your Amadeus API Key: " amadeus_key
        read -p "Enter your Amadeus API Secret: " amadeus_secret
        
        if [ -z "$rapidapi_key" ] || [ -z "$amadeus_key" ] || [ -z "$amadeus_secret" ]; then
            echo "❌ Missing credentials"
            exit 1
        fi
        
        echo ""
        echo "Setting all credentials in Railway..."
        railway variables set RAPIDAPI_KEY="$rapidapi_key"
        railway variables set AMADEUS_API_KEY="$amadeus_key"
        railway variables set AMADEUS_API_SECRET="$amadeus_secret"
        
        if [ $? -eq 0 ]; then
            echo "✅ All credentials configured successfully!"
        else
            echo "❌ Failed to set variables"
            exit 1
        fi
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🚀 Deploying bot with new configuration..."
railway up --detach

echo ""
echo "✅ Setup complete!"
echo ""
echo "Test your hotel search:"
echo "/search_hotels London"
echo ""
echo "Your bot will now use real hotel data from external APIs!"
