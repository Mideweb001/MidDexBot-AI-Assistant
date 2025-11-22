# 🗺️ Complete Database Population Guide

## ✅ What's Been Done

### 1. Unified Commands
- **`/food [state]`** - Single command for all restaurant searches
- **`/hotel [state]`** - Single command for all hotel searches
- State selection menu shows all 36 Nigerian states + FCT Abuja
- Commands deployed to production: https://telegrambot-production-5661.up.railway.app

### 2. Comprehensive State Coverage
Created `src/config/NigerianStates.js` with:
- All 36 Nigerian states + FCT Abuja
- GPS coordinates for each capital city
- Smart name parsing (handles "Benin", "Port Harcourt", "Abuja", etc.)
- Region-based grouping (South West, South East, North Central, etc.)

### 3. Population Scripts Ready
- **`scripts/populate-restaurants.js`** - Fetch restaurants from Google Maps
- **`scripts/populate-hotels.js`** - Fetch hotels from Google Maps
- Both cover all 37 locations with appropriate search radii

## 🚀 How to Populate Databases

### Option 1: Via Railway Dashboard (RECOMMENDED)

1. **Go to Railway Dashboard**
   - Open: https://railway.app/project/[your-project-id]
   - Click on your `telegramBot` service
   - Click on "Shell" tab

2. **Populate Restaurants**
   ```bash
   node scripts/populate-restaurants.js
   ```
   - Duration: ~15-20 minutes
   - Expected: 2,000-3,000 restaurants
   - Covers all 37 Nigerian locations

3. **Populate Hotels**
   ```bash
   node scripts/populate-hotels.js
   ```
   - Duration: ~10-15 minutes
   - Expected: 1,500-2,000 hotels
   - Covers all 37 Nigerian locations

### Option 2: Via Railway CLI

```bash
# Make sure you're in the project directory
cd /Users/jmohsmith/telegramBot

# Link to Railway project (if not already linked)
railway link

# Populate restaurants
railway shell
> node scripts/populate-restaurants.js
> exit

# Populate hotels  
railway shell
> node scripts/populate-hotels.js
> exit
```

### Option 3: Local Population (Then Sync to Production)

If you have a local database:

```bash
# 1. Run scripts locally
node scripts/populate-restaurants.js
node scripts/populate-hotels.js

# 2. Export data
node scripts/db-manager.js export all

# 3. Import to production (via Railway dashboard or SQL client)
```

## 📊 What the Scripts Do

### Restaurant Population (`populate-restaurants.js`)
- **API**: Google Places API
- **Locations**: 37 cities (all Nigerian state capitals)
- **Searches per city**: 11 cuisine types (Nigerian, Fast Food, Chinese, Italian, etc.)
- **Data captured**:
  - ✅ Name, address, GPS coordinates
  - ✅ Phone, website, rating, reviews
  - ✅ Cuisine type, price range
  - ✅ Operating hours
  - ✅ Delivery info (radius, fee, minimum order)

**Expected Output**:
```
📍 Lagos, Lagos
  ✅ Mama Cass - Nigerian - ⭐4.5
  ✅ KFC Ikeja - Fast Food - ⭐4.2
  ✅ Yellow Chilli - Indian - ⭐4.6
  ...
✅ Lagos Complete: 120 restaurants added

📍 Abuja, FCT
  ✅ Jevinik Restaurant - Continental - ⭐4.7
  ...

📊 POPULATION REPORT
============================================================
Total Restaurants in Database: 2,543
✅ Added this session: 2,543
⏭️  Skipped (duplicates): 87
❌ Errors: 5

🍽️  By Cuisine Type:
   Nigerian: 856
   Fast Food: 623
   Continental: 412
   Chinese: 298
   Indian: 187
   Italian: 167

📍 Coverage: 37 cities processed
```

### Hotel Population (`populate-hotels.js`)
- **API**: Google Places API
- **Locations**: 37 cities (all Nigerian state capitals)
- **Searches per city**: 4 types (hotel, lodging, resort, guest_house)
- **Data captured**:
  - ✅ Name, address, GPS coordinates
  - ✅ Phone, website, rating, reviews
  - ✅ Category (Luxury, Business, Standard, Budget, Resort)
  - ✅ Star rating (1-5 stars)
  - ✅ Price per night (₦5,000 - ₦150,000)
  - ✅ Amenities (WiFi, Pool, Gym, Restaurant, etc.)
  - ✅ Check-in/check-out times
  - ✅ Google Maps integration (place_id, maps_url)

**Expected Output**:
```
📍 Lagos, Lagos
  ✅ Eko Hotels & Suites - Luxury - ⭐4.7 - ₦85,000/night
  ✅ Radisson Blu - Business - ⭐4.5 - ₦45,000/night
  ✅ Best Western - Standard - ⭐4.2 - ₦22,000/night
  ...
✅ Lagos Complete: 65 hotels added

📊 HOTEL POPULATION REPORT
============================================================
Total Hotels in Database: 1,847
✅ Added this session: 1,847
⏭️  Skipped (duplicates): 34
❌ Errors: 3

🏨 By Category:
   Standard: 687 hotels (avg: ₦23,456/night)
   Budget: 542 hotels (avg: ₦9,832/night)
   Business: 312 hotels (avg: ₦38,750/night)
   Luxury: 198 hotels (avg: ₦78,234/night)
   Resort: 108 hotels (avg: ₦52,900/night)

📍 Top 10 States by Hotel Count:
   Lagos: 285 hotels
   FCT: 198 hotels
   Rivers: 142 hotels
   ...

🗺️  Coverage: 37 cities processed
```

## 🧪 Testing After Population

### 1. Test Restaurant Commands

In Telegram, try:
```
/food
→ Should show state selection menu with all 36 states + FCT

/food Lagos
→ Should show restaurants in Lagos with ratings, delivery info

/food Port Harcourt
→ Should show restaurants in Rivers state

Click "Browse Restaurants" → Type "Benin"
→ Should show restaurants in Edo state
```

### 2. Test Hotel Commands

In Telegram, try:
```
/hotel
→ Should show state selection menu with all 36 states + FCT

/hotel Abuja  
→ Should show hotels in FCT with prices, ratings, amenities

/hotel Enugu
→ Should show hotels in Enugu state

Click state from menu → See hotels with Google Maps data
```

### 3. Verify Database

Check that data exists:
```bash
railway shell
> node scripts/db-manager.js stats

Expected output:
📊 Database Statistics:
   Restaurants: 2,543
   Hotels: 1,847
   Users: [current count]
   ...
```

## ⚙️ Configuration

### API Key
The scripts use `GOOGLE_MAPS_API_KEY` from environment variables:
- ✅ Already set in Railway: `AIzaSyBVX84gYl4Unw4qMhygFHxbSg6Y80MAB4o`
- ✅ Restrictions applied:
  - HTTP referrers: `*.railway.app/*`
  - APIs: Places API, Geocoding API, Maps JavaScript API

### Rate Limits
Scripts include delays to respect Google API limits:
- 100ms between place details requests
- 500ms between cuisine/type searches
- Total time: ~25-35 minutes for both scripts

### Cost Estimate
Google Places API pricing (as of 2024):
- Nearby Search: $32 per 1,000 requests
- Place Details: $17 per 1,000 requests

**Estimated cost for full population**:
- Restaurants: ~407 nearby searches + ~2,543 details = $29.50
- Hotels: ~148 nearby searches + ~1,847 details = $36.10
- **Total: ~$65-70** (one-time)

💡 **Tip**: Google provides $200/month free credit, so this will be FREE!

## 🔧 Troubleshooting

### "API Key Invalid"
- Check Railway environment variable: `railway variables | grep GOOGLE`
- Verify key restrictions allow Railway domain
- Test key: `curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=6.5244,3.3792&radius=5000&type=restaurant&key=YOUR_KEY"`

### "Database Connection Failed"
- Ensure you're running in Railway environment (not locally with `railway run`)
- Check DATABASE_URL is set: `railway variables | grep DATABASE`
- Try restarting service: `railway restart`

### "No Results Found"
- Some smaller cities may have fewer listings
- This is expected - scripts handle gracefully
- Mock data fallback exists in bot code

### "Duplicate Entries"
- Scripts check for existing entries before adding
- Skipped duplicates are counted in report
- Safe to re-run scripts (won't create duplicates)

## 📋 Next Steps After Population

1. **✅ Test Commands**: Try `/food` and `/hotel` in Telegram
2. **✅ Verify Coverage**: Check multiple states have data
3. **✅ Monitor Performance**: Ensure searches are fast
4. **✅ Check Ratings**: Verify Google ratings display correctly
5. **✅ Test Ordering**: Try complete restaurant order flow
6. **✅ Test Booking**: Try complete hotel booking flow

## 🎯 Current Status

- ✅ Unified commands deployed to production
- ✅ All 36 states + FCT configured
- ✅ Population scripts created and tested
- ⏳ **READY TO POPULATE** - Run scripts in Railway Shell
- ⏳ Full end-to-end testing pending

## 📞 Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Check bot status: `curl https://telegrambot-production-5661.up.railway.app/health`
3. Review script output for specific errors
4. Verify API key has sufficient quota

---

**Last Updated**: November 22, 2025
**Bot URL**: https://telegrambot-production-5661.up.railway.app
**GitHub**: https://github.com/Mideweb001/MidDexBot-AI-Assistant
