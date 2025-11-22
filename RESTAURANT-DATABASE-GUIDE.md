# 🍽️ Restaurant Database Setup & Management Guide

## Overview

This guide explains how to populate your MidDexBot database with real Nigerian restaurants so users can find restaurants near their location automatically.

---

## 🚀 Quick Start

### 1. Setup Google Maps API Key

You already have: `AIzaSyA_emBvG-_Q1szvRUz9CiYEKdheJ06HHEI`

Make sure it's in Railway environment variables:
```bash
railway variables set GOOGLE_MAPS_API_KEY=AIzaSyA_emBvG-_Q1szvRUz9CiYEKdheJ06HHEI
```

### 2. Run Restaurant Population Script

**Locally (for testing):**
```bash
node scripts/populate-restaurants.js
```

**On Railway (production):**
```bash
railway run node scripts/populate-restaurants.js
```

This script will:
- ✅ Connect to your database
- ✅ Search 20 Nigerian cities
- ✅ Fetch restaurants from Google Places API
- ✅ Save restaurants with GPS coordinates
- ✅ Generate a detailed report

---

## 🗺️ Cities Covered

The script automatically populates restaurants from these cities:

| Major Cities | State Capitals |
|-------------|----------------|
| Lagos | Benin City |
| Abuja | Enugu |
| Port Harcourt | Kaduna |
| Kano | Jos |
| Ibadan | Calabar |
| | Warri, Owerri, Uyo |
| | Abeokuta, Ilorin |
| | Akure, Osogbo |
| | Makurdi, Bauchi |
| | Minna |

**Total: 20 cities** with radius coverage:
- Major cities: 25-50km radius
- State capitals: 10-20km radius

---

## 🍕 Cuisine Types Searched

The script searches for:
1. Nigerian restaurants
2. African restaurants
3. Fast food
4. Cafes & bakeries
5. Pizza places
6. Chinese restaurants
7. Indian restaurants
8. Italian restaurants
9. American restaurants
10. General restaurants

---

## 📊 What Gets Saved

For each restaurant:

```javascript
{
  name: "Jollof Palace",
  description: "Nigerian restaurant in Lagos, Lagos",
  address: "123 Allen Avenue, Lagos",
  latitude: 6.5244,
  longitude: 3.3792,
  phone: "+234 803 123 4567",
  cuisine_type: "Nigerian",
  operating_hours: {
    monday: { open: "09:00", close: "22:00" },
    tuesday: { open: "09:00", close: "22:00" },
    // ...
  },
  delivery_radius: 5.0,      // km
  delivery_fee: 450,         // NGN
  minimum_order: 1500,       // NGN
  rating: 4.5,
  total_reviews: 234,
  is_active: true,
  is_verified: true,         // Auto-verified if rating >= 4.0
  tags: ["Lagos", "Lagos", "nigerian"],
  features: ["delivery", "pickup", "dine-in"]
}
```

---

## 🎯 How Location-Based Search Works

### User Flow:

1. **User clicks "Browse Restaurants"**
   - Bot asks for location
   - Shows button: "📍 Share My Location"

2. **User shares location**
   - Bot receives GPS coordinates (lat, lng)
   - Bot searches database within 20km radius

3. **Bot displays results**
   - Sorted by distance (closest first)
   - Shows: name, cuisine, distance, rating, delivery fee
   - User can tap to see menu

### Example Output:

```
🍽️ Restaurants Near You

📍 Found 12 restaurants

1. Jollof Palace
   ⭐⭐⭐⭐⭐ 4.5 • Nigerian
   📍 0.8km away
   💰 ₦450 delivery • Min: ₦1500

2. Chicken Republic
   ⭐⭐⭐⭐ 4.2 • Fast Food
   📍 1.2km away
   💰 ₦300 delivery • Min: ₦1000

3. Sweet Sensation
   ⭐⭐⭐⭐ 4.3 • Cafe
   📍 1.5km away
   💰 ₦400 delivery • Min: ₦1200

...
```

---

## 🔧 Database Structure

### Tables Used:

1. **restaurants** - Main restaurant data
2. **menu_items** - Restaurant menu items
3. **food_orders** - Customer orders
4. **users** - Customer accounts

### Key Indexes:

```sql
-- For fast location queries
INDEX on (latitude, longitude)
INDEX on (cuisine_type)
INDEX on (is_active)
INDEX on (rating)
```

---

## 📱 Restaurant Owner Registration

Restaurant owners can register their business:

### Command: `/register_restaurant`

**Registration Steps:**

1. Restaurant name
2. Description
3. Full address
4. Location (GPS coordinates)
5. Phone number
6. Email (optional)
7. Cuisine type
8. Operating hours
9. Delivery settings
10. Logo upload (optional)

**Auto-Features:**
- ✅ Free listing
- ✅ Order management dashboard
- ✅ Menu management
- ✅ Order notifications
- ✅ Analytics & reports

---

## 🔄 Regular Updates

### Option 1: Manual Update (Recommended)

Run the population script monthly:

```bash
# Railway
railway run node scripts/populate-restaurants.js

# Local
node scripts/populate-restaurants.js
```

The script automatically:
- ✅ Skips duplicate restaurants
- ✅ Updates existing data
- ✅ Adds new restaurants
- ✅ Maintains data integrity

### Option 2: Automated Schedule (Advanced)

Create a cron job in Railway:

```yaml
# railway.toml
[deploy]
  startCommand = "node src/server.js"

[[cron]]
  schedule = "0 0 1 * *"  # 1st of every month
  command = "node scripts/populate-restaurants.js"
```

### Option 3: API Integration (Pro)

For real-time updates, integrate with:

- **Google Places API** - Real-time restaurant data
- **Yelp API** - Reviews and ratings
- **Foursquare API** - Business verification

---

## 🧪 Testing

### Test Location-Based Search:

1. **Start bot:** `/start`
2. **Browse restaurants:** Click "🍽️ Browse Restaurants"
3. **Share location:** Click "📍 Share My Location"
4. **Expected result:** See restaurants within 20km

### Test City Search:

1. **Type:** `/browse Lagos`
2. **Expected result:** See restaurants in Lagos

### Test Cuisine Filter:

1. **Click:** "Browse by Cuisine"
2. **Select:** "Nigerian"
3. **Expected result:** See all Nigerian restaurants

---

## 📈 Expected Results

After running the population script:

```
📊 POPULATION REPORT
============================================================

📈 Statistics:
   Total Restaurants in Database: 1,247
   ✅ Added this session: 1,247
   ⏭️  Skipped (duplicates): 0
   ❌ Errors: 0

🍽️ By Cuisine Type:
   Nigerian: 423
   Fast Food: 289
   Cafe: 178
   Chinese: 112
   Italian: 98
   Continental: 87
   Indian: 60

📍 Coverage:
   Cities processed: 20
   Restaurants with GPS coordinates: 1,247

============================================================
✅ Database population complete!
============================================================
```

---

## 🐛 Troubleshooting

### Issue 1: "No restaurants found"

**Cause:** Database is empty
**Solution:** Run `node scripts/populate-restaurants.js`

### Issue 2: "API key not found"

**Cause:** GOOGLE_MAPS_API_KEY not set
**Solution:** 
```bash
railway variables set GOOGLE_MAPS_API_KEY=AIzaSyA_emBvG-_Q1szvRUz9CiYEKdheJ06HHEI
```

### Issue 3: "Duplicate restaurants"

**Cause:** Running script multiple times
**Solution:** Script auto-skips duplicates. This is normal.

### Issue 3: "API quota exceeded"

**Cause:** Google Places API daily limit reached
**Solution:** 
- Wait 24 hours
- Upgrade Google API plan
- Use mock data fallback (already implemented)

### Issue 5: "Wrong location results"

**Cause:** Restaurant coordinates incorrect
**Solution:** 
1. Check restaurant in database
2. Update coordinates manually
3. Re-run script to refresh

---

## 💰 Cost Estimates

### Google Places API Costs:

- **Nearby Search:** $32 per 1,000 requests
- **Place Details:** $17 per 1,000 requests

**Population Script Usage:**
- 20 cities × 10 searches = 200 requests
- 200 restaurants × 1 detail = 200 requests
- **Total: 400 requests ≈ $16/month** (if run monthly)

**Google Free Tier:**
- $200 credit per month
- More than enough for this usage

---

## 🎯 Next Steps

### Immediate:
1. ✅ Run population script
2. ✅ Test location-based search
3. ✅ Deploy to production

### Short-term:
- [ ] Add restaurant photos from Google Places
- [ ] Implement menu item auto-population
- [ ] Add user reviews system
- [ ] Enable online payment

### Long-term:
- [ ] Partner with real restaurants
- [ ] Integrate delivery drivers
- [ ] Real-time order tracking
- [ ] In-app messaging

---

## 📞 Support

**Issues with the script?**
- Check logs: `railway logs --tail`
- Review error messages
- Verify API key is valid

**Need more cities?**
Edit `scripts/populate-restaurants.js`:
```javascript
const NIGERIAN_CITIES = [
  // Add more cities here
  { name: 'Aba', state: 'Abia', lat: 5.1067, lng: 7.3667, radius: 15000 },
];
```

---

## ✅ Checklist

Before going live:

- [ ] Google Maps API key added to Railway
- [ ] Population script run successfully
- [ ] Test location sharing works
- [ ] Test restaurant search returns results
- [ ] Test restaurant details display correctly
- [ ] Test distance calculations accurate
- [ ] Test delivery radius logic works
- [ ] Verify operating hours display
- [ ] Check ratings and reviews show
- [ ] Confirm menu items load (if any)

---

**Last Updated:** November 22, 2025
**Version:** 1.0.0
**Status:** ✅ Ready for Production
