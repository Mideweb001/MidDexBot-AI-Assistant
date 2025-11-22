# Google Maps API Setup Guide for Railway

## 🎯 Quick Setup (5 Minutes)

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Project name: `TelegramBot-Hotels` (or any name)
   - Click "Create"
   - Wait 10-20 seconds for project to be created

### Step 2: Enable Places API

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" → "Library"
   - Or go directly to: https://console.cloud.google.com/apis/library

2. **Search for Places API**
   - In the search box, type: `Places API`
   - Click on "Places API" (not "Places API (New)")

3. **Enable the API**
   - Click the blue "Enable" button
   - Wait 5-10 seconds

### Step 3: Create API Key

1. **Go to Credentials**
   - In left sidebar: "APIs & Services" → "Credentials"
   - Or go to: https://console.cloud.google.com/apis/credentials

2. **Create API Key**
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "API Key"
   - A popup appears with your key: `AIzaSy...`
   - **COPY THIS KEY IMMEDIATELY** (you'll need it in next step)

3. **Optional but Recommended: Restrict the Key**
   - Click "Edit API key" (or the key name)
   - Under "API restrictions":
     - Select "Restrict key"
     - Check "Places API"
   - Click "Save"

### Step 4: Add Key to Railway

#### Option A: Using Railway CLI (Fastest)

```bash
# In your terminal, navigate to your project folder
cd /Users/jmohsmith/telegramBot

# Set the environment variable
railway variables set GOOGLE_MAPS_API_KEY=AIzaSy...YOUR_KEY_HERE

# Restart the bot
railway restart

# Check if it worked
railway logs --tail
```

#### Option B: Using Railway Dashboard (Web UI)

1. **Open Railway Dashboard**
   - Go to: https://railway.app/dashboard
   - Click on your "telegramBot" project

2. **Open Service Settings**
   - Click on your service (the one running your bot)
   - Click the "Variables" tab

3. **Add New Variable**
   - Click "+ New Variable"
   - Variable name: `GOOGLE_MAPS_API_KEY`
   - Variable value: `AIzaSy...` (paste your key)
   - Click "Add"

4. **Restart Service**
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment
   - Or the service will auto-restart

### Step 5: Verify It Works

1. **Check Railway Logs**
   ```bash
   railway logs --tail
   ```
   
   Look for:
   ```
   ✅ HotelDiscoveryService initialized
   🗺️ Google Maps API key detected
   ✅ Bot started successfully
   ```

2. **Test in Telegram**
   - Open your bot
   - Type: `/hotels`
   - Click "📍 Find Nearby Hotels"
   - Share your location
   - You should see REAL hotels from Google Maps!

3. **Verify Real Data**
   - If you see actual hotel names (not "Sample Hotel")
   - If you see real addresses and phone numbers
   - If photos load properly
   - ✅ **It's working!**

## 💰 Costs and Limits

### Free Tier (What You Get)
- **$200 credit per month** from Google
- **Places Nearby Search**: $0.032 per request
- **Free requests per month**: ~6,250 searches
- **Place Details**: $0.017 per request
- **Photos**: FREE (no charge)

### Typical Usage
- **Small bot** (100 users): ~300 searches/month = $9.60 (~FREE)
- **Medium bot** (1,000 users): ~3,000 searches/month = $96 (~FREE with credits)
- **Large bot** (10,000 users): ~30,000 searches/month = $960 (need billing)

### How to Stay in Free Tier
1. **Enable billing** (required even for free tier)
2. **Set budget alerts** at $200/month
3. **Your bot will use < $100/month** for normal usage
4. **You'll stay within free credits**

## 🔒 Security Best Practices

### Restrict Your API Key

1. **Application Restrictions**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click your API key
   - Under "Application restrictions": Select "None" (for server-side)
   - Or "IP addresses" and add Railway's IPs

2. **API Restrictions** (Recommended)
   - Under "API restrictions": Select "Restrict key"
   - Check only: "Places API"
   - Uncheck all others
   - Click "Save"

### Monitor Usage

1. **Set Up Budget Alerts**
   - Go to: https://console.cloud.google.com/billing/budgets
   - Click "Create Budget"
   - Set amount: $200/month
   - Add email for alerts

2. **Check Usage**
   - Dashboard: https://console.cloud.google.com/apis/dashboard
   - See requests per day
   - Monitor quota usage

## 🧪 Testing Without API Key

If you want to test first before adding the key:

```bash
# The bot already works with mock data!
# Just test in Telegram:

1. /hotels → Browse by State → Lagos → Ikeja
   Result: Shows 3 sample hotels

2. /hotels → Find Nearby → Share location
   Result: Shows 3 sample hotels near you

# You'll see this warning:
"⚠️ Google Maps API not configured. Showing sample data."

# Add the API key when ready for real data!
```

## 🐛 Troubleshooting

### Issue: "API key not detected"
**Solution**:
```bash
# Check if variable is set
railway variables

# Should show:
# GOOGLE_MAPS_API_KEY=AIzaSy...

# If not, set it again:
railway variables set GOOGLE_MAPS_API_KEY=AIzaSy...
railway restart
```

### Issue: "API request failed"
**Possible causes**:
1. API key is invalid
2. Places API not enabled
3. Billing not enabled (required even for free tier)
4. API restrictions blocking requests

**Solution**:
```bash
# Verify in Google Cloud Console:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Check key is correct
3. Go to: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
4. Verify "Places API" is enabled
5. Go to: https://console.cloud.google.com/billing
6. Verify billing is enabled (even for free tier)
```

### Issue: "Still showing mock data"
**Solution**:
```bash
# Check Railway logs
railway logs | grep -i "google\|api\|hotel"

# Should see:
# "🗺️ Google Maps API key detected"

# If not:
railway variables set GOOGLE_MAPS_API_KEY=AIzaSy...
railway restart
railway logs --tail
```

### Issue: "Quota exceeded"
**Solution**:
- You've used your free $200 credit
- Check usage: https://console.cloud.google.com/apis/dashboard
- Either wait for next month or add billing

## 📊 Quick Reference

### Railway Commands
```bash
# Set API key
railway variables set GOOGLE_MAPS_API_KEY=AIzaSy...

# Check all variables
railway variables

# Remove API key (if needed)
railway variables delete GOOGLE_MAPS_API_KEY

# Restart bot
railway restart

# View logs
railway logs --tail

# Check deployment status
railway status
```

### Google Cloud Console Links
- **Console Home**: https://console.cloud.google.com/
- **API Library**: https://console.cloud.google.com/apis/library
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **API Dashboard**: https://console.cloud.google.com/apis/dashboard
- **Billing**: https://console.cloud.google.com/billing
- **Quotas**: https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas

## ✅ Success Checklist

After setup, verify these:

- [ ] Google Cloud project created
- [ ] Places API enabled
- [ ] API key created and copied
- [ ] API key added to Railway
- [ ] Railway bot restarted
- [ ] Logs show "Google Maps API key detected"
- [ ] Tested `/hotels` in Telegram
- [ ] Shared location and saw REAL hotels
- [ ] Hotel photos loading
- [ ] Google Maps links working
- [ ] No "mock data" warnings

## 🎉 You're Done!

Your bot now has access to:
- ✅ 28+ million hotels worldwide from Google Maps
- ✅ Real-time hotel data (ratings, photos, reviews)
- ✅ Accurate locations and directions
- ✅ Up-to-date opening hours
- ✅ Direct links to hotel websites and phones
- ✅ FREE for up to ~6,250 searches/month

---

**Need Help?**
- Check troubleshooting section above
- Review Railway logs: `railway logs --tail`
- See full integration docs: `HOTEL-GOOGLE-MAPS-INTEGRATION.md`

**Ready to Test?**
1. Open Telegram
2. Type: `/hotels`
3. Click "📍 Find Nearby Hotels"
4. Share your location
5. See REAL hotels! 🎉
