# 🚀 Deployment Guide - Restaurant Features Update

## ✅ Pre-Deployment Checklist

### Local Verification
- [x] All files committed to git
- [x] Code pushed to GitHub
- [x] Database migration script created
- [x] Local database migration successful
- [x] All syntax errors fixed

### Deployment Status
**Date**: November 21, 2025  
**Branch**: main  
**Commit**: 1b52f19 - "feat: Add advanced restaurant discovery & ordering system"  
**Changes**: 9,646 insertions, 347 deletions  
**New Files**: 3 service files + 14 documentation files  

---

## 🔄 Deployment Process

### Step 1: GitHub ✅ COMPLETED
```bash
git add .
git commit -m "feat: Add advanced restaurant discovery & ordering system with smart UI"
git push origin main
```

**Status**: ✅ Successfully pushed to GitHub
**URL**: https://github.com/Mideweb001/MidDexBot-AI-Assistant

---

### Step 2: Railway Deployment

#### Option A: Auto-Deploy (Recommended)
Railway is configured to auto-deploy from GitHub. The deployment should start automatically within 1-2 minutes.

**Check deployment status:**
```bash
railway status
```

**View logs:**
```bash
railway logs
```

#### Option B: Manual Deploy
If auto-deploy doesn't trigger, use manual deployment:

```bash
railway up
```

---

### Step 3: Database Migration on Railway

After Railway deployment completes, run the migration on production:

```bash
# Set Railway environment to production
railway run node scripts/migrate-database.js
```

**Expected Output:**
```
✅ Database connection established successfully
✅ Database schema updated successfully
✅ Restaurant table: X records
✅ Menu items table: X records
✅ Food orders table: X records
```

---

## 🔍 Post-Deployment Verification

### 1. Check Health Endpoint
```bash
curl https://YOUR-RAILWAY-URL/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "uptime": "X seconds",
  "timestamp": "2025-11-21T..."
}
```

### 2. Test Bot Commands

Open your Telegram bot and test:

#### Basic Navigation
```
/start          → Should show main menu with Restaurants option
/menu           → Should display all 8 categories
/restaurants    → Should show restaurant hub menu
```

#### Restaurant Discovery
```
/browse         → Should show state selection
/browse Lagos   → Should list restaurants in Lagos
/nearby         → Should request location
/cuisine        → Should show cuisine types
/search pizza   → Should search for pizza
```

#### Cart & Orders
```
/cart           → Should show empty cart or items
/track          → Should show active orders or prompt for order ID
```

### 3. Test Complete Flow

**Complete Order Journey:**
1. Send `/browse Lagos`
2. Tap a state button
3. Tap a restaurant
4. Tap "Add to Cart" on a menu item
5. Send `/cart` to view
6. Tap "Checkout"
7. Share location
8. Verify order confirmation
9. Send `/track [order_id]` to view tracking

---

## 🎯 Expected Behavior

### Restaurant Discovery
- ✅ State selection shows 37 Nigerian states
- ✅ Restaurant list shows ratings, distance, prices
- ✅ Location search finds nearby restaurants
- ✅ Distance calculated accurately
- ✅ Filters and sorting work correctly

### Shopping Cart
- ✅ Add to cart creates cart
- ✅ Cart displays items with quantities
- ✅ +/- buttons modify quantities
- ✅ Totals calculate correctly (subtotal + 8% tax + delivery)
- ✅ Validation checks minimum order

### Checkout
- ✅ Location request sent
- ✅ Order created successfully
- ✅ Confirmation message sent
- ✅ Cart cleared after order

### Order Tracking
- ✅ Shows order status
- ✅ Progress bar displays
- ✅ ETA calculated
- ✅ Rider info shown when assigned
- ✅ Timeline displays correctly

---

## 🐛 Troubleshooting

### Issue: Bot Not Responding
**Solution:**
```bash
# Check Railway logs
railway logs

# Restart the service
railway restart
```

### Issue: Database Connection Error
**Solution:**
```bash
# Verify DATABASE_URL is set
railway variables

# Re-run migration
railway run node scripts/migrate-database.js
```

### Issue: "No restaurants found"
**Solution:**
This is expected if database is empty. You need to:
1. Register restaurants via bot: `/register_restaurant`
2. Or add sample data via database script

### Issue: Cart not saving
**Solution:**
Cart is stored in memory. After restart, carts are cleared. This is expected behavior. For persistence, migrate to Redis (planned enhancement).

### Issue: Order tracking not working
**Solution:**
Ensure FoodOrder model has all required fields. Run migration:
```bash
railway run node scripts/migrate-database.js
```

---

## 📊 Monitoring

### Check Railway Dashboard
1. Visit: https://railway.app/dashboard
2. Select your project
3. Check:
   - ✅ Deployment status
   - ✅ Memory usage (should be < 512MB)
   - ✅ CPU usage (should be < 50%)
   - ✅ Error rate (should be 0%)

### Monitor Bot Activity
```bash
# Live logs
railway logs --tail

# Filter errors only
railway logs --tail | grep "ERROR\|❌"

# Filter restaurant features
railway logs --tail | grep "restaurant\|cart\|order"
```

---

## 🔐 Environment Variables

Required variables on Railway:

```env
# Core
TELEGRAM_BOT_TOKEN=your_bot_token
NODE_ENV=production
WEBHOOK_URL=https://your-railway-url.railway.app

# Database
DATABASE_URL=postgresql://... (auto-set by Railway)

# Optional
OPENAI_API_KEY=your_key (for AI features)
RAPIDAPI_KEY=your_key (for hotel API)
```

**Verify all variables are set:**
```bash
railway variables
```

---

## 📈 Performance Expectations

### Response Times
- Command response: < 500ms
- Restaurant list: < 1s
- Cart operations: < 300ms
- Order tracking: < 800ms

### Resource Usage
- Memory: 200-400MB
- CPU: 5-20%
- Database connections: 5-10

### Capacity
- Concurrent users: 1,000+
- Carts in memory: 10,000+
- Orders per day: Unlimited

---

## ✅ Deployment Success Criteria

- [ ] GitHub push successful
- [ ] Railway deployment completed
- [ ] Health endpoint responding
- [ ] All commands working
- [ ] Restaurant discovery functional
- [ ] Cart operations working
- [ ] Checkout flow complete
- [ ] Order tracking displaying
- [ ] No errors in logs
- [ ] Response times within targets

---

## 🎉 Deployment Complete!

Once all checks pass, your bot is **LIVE** with:

✨ State-wide restaurant browsing  
✨ GPS-based location search  
✨ Interactive shopping cart  
✨ Complete checkout flow  
✨ Real-time order tracking  
✨ Chowdeck/Seamless-level features  

---

## 📞 Support

If issues persist:
1. Check logs: `railway logs`
2. Review error messages
3. Verify environment variables
4. Test locally first: `npm run dev`
5. Check documentation files

---

**Deployment Date**: November 21, 2025  
**Version**: 2.0.0 (Restaurant Features)  
**Status**: ✅ Ready for Production  

🚀 **Happy Deploying!**
