# 🚀 Local Development Guide

**Date**: November 21, 2025  
**Purpose**: Complete guide to running MidDexBot locally for testing

---

## 📋 Quick Start Checklist

### Prerequisites
- [x] Node.js installed (v18+)
- [x] PostgreSQL database (Railway cloud)
- [x] Telegram Bot Token
- [x] All API keys configured

### Setup Steps
1. ✅ Environment variables configured
2. ✅ Dependencies installed (`npm install`)
3. ⏳ Database connected
4. ⏳ Bot running locally
5. ⏳ Features tested

---

## 🔧 Terminal Setup

Open **4 terminals** for efficient development:

### Terminal 1: Bot Server (Main)
```bash
cd /Users/jmohsmith/telegramBot
npm start
```
**Purpose**: Run the main bot server  
**Watch for**: "✅ MidDexBot started successfully"

### Terminal 2: Database Monitor
```bash
cd /Users/jmohsmith/telegramBot
node scripts/db-manager.js stats
```
**Purpose**: Monitor database connection and stats  
**Commands**:
- `node scripts/db-manager.js stats` - Show stats
- `node scripts/db-manager.js backup` - Backup database
- `node scripts/db-manager.js test` - Test connection

### Terminal 3: Logs & Debugging
```bash
cd /Users/jmohsmith/telegramBot
tail -f logs/bot.log
```
**Purpose**: Real-time log monitoring  
**Watch for**: Errors, warnings, API responses

### Terminal 4: Quick Commands
```bash
cd /Users/jmohsmith/telegramBot
# Keep open for quick commands:
# - git status
# - npm install <package>
# - curl http://localhost:3000/health
```

---

## 📁 Project Navigation Map

### Core Files (Most Important)
```
src/
├── server.js              ⭐ MAIN BOT SERVER (8,869 lines)
│   ├── Lines 1-250:      Initialization & imports
│   ├── Lines 250-1000:   Command handlers
│   ├── Lines 1450-2250:  Callback handlers
│   ├── Lines 5500-5750:  Menu displays
│   ├── Lines 8000-8500:  Restaurant/Food features
│   └── Lines 8500+:      Hotel & other features
│
├── config/
│   ├── InterfaceManager.js   🎨 UI & Menus
│   └── ModernUX.js           🎨 UX Components
│
├── models/
│   ├── index.js              📊 Database models index
│   ├── Restaurant.js         🍽️ Restaurant model
│   ├── Business.js           🏬 Business model
│   ├── Hotel.js              🏨 Hotel model
│   └── [20+ other models]
│
└── services/
    ├── FoodOrderService.js   🍕 Food delivery logic
    ├── BusinessService.js    🏬 Business search logic
    ├── HotelService.js       🏨 Hotel booking logic
    └── [10+ other services]
```

### New Nigerian Features (Just Added)
```
server.js:
├── Line 1718:  nigerian_cuisines callback
├── Line 1890:  Nigerian cuisine category handler
├── Line 880-915: Nigerian city commands (/food_lagos, etc.)
├── Line 3907-3912: Command registration
├── Line 8156-8315: Nigerian cuisine methods
    ├── showNigerianCuisineCategories()
    ├── searchRestaurantsByCuisine()
    └── searchRestaurantsByCity()
```

### Configuration Files
```
.env                      🔐 Environment variables (NEVER commit!)
.env.example             📝 Template for .env
package.json             📦 Dependencies
railway.json             🚂 Railway deployment config
```

### Documentation
```
README.md                📖 Main documentation
START-HERE.md            🚀 Getting started guide
NIGERIAN-FEATURES-COMPLETE.md  🇳🇬 Nigerian features docs
MARKETPLACE-TESTING-GUIDE.md   🧪 Testing guide
FINAL-BOT-STATUS.md      📊 Complete status report
```

---

## 🗺️ Feature Location Map

### Nigerian Food Features
| Feature | File | Line | Method |
|---------|------|------|--------|
| Cuisine Categories Menu | server.js | 8156 | `showNigerianCuisineCategories()` |
| Cuisine Search | server.js | 8192 | `searchRestaurantsByCuisine()` |
| City Search | server.js | 8268 | `searchRestaurantsByCity()` |
| Lagos Command | server.js | 885 | `/food_lagos` handler |
| Abuja Command | server.js | 890 | `/food_abuja` handler |
| Port Harcourt Command | server.js | 895 | `/food_portharcourt` handler |

### Marketplace Features
| Feature | File | Line | Method |
|---------|------|------|--------|
| Search Options | server.js | 5609 | `showBusinessSearchOptions()` |
| Category Browse | server.js | 5625 | `showBusinessCategories()` |
| Location Search | server.js | 5698 | `searchBusinessesByLocation()` |
| Keyword Search | server.js | 5734 | `searchBusinessesByKeyword()` |

### Hotels Features
| Feature | File | Line | Method |
|---------|------|------|--------|
| Hotel Search | server.js | 7550 | `searchHotels()` |
| Hotel Details | server.js | 7650 | `showHotelDetails()` |
| Booking | server.js | 7800 | `createBooking()` |

---

## 🔍 Quick Search Commands

### Find a Feature
```bash
# Search for Nigerian food features
grep -n "nigerian" src/server.js

# Find all restaurant methods
grep -n "async.*restaurant" src/server.js

# Find callback handlers
grep -n "case '" src/server.js | grep -i food
```

### Find Errors
```bash
# Check for syntax errors
npm run lint

# Find TODO comments
grep -rn "TODO" src/

# Find console.error
grep -rn "console.error" src/
```

---

## 🧪 Testing Workflow

### 1. Start Local Server
```bash
# Terminal 1
npm start

# Wait for: "✅ MidDexBot started successfully"
# Bot URL: http://localhost:3000
```

### 2. Test Health Endpoint
```bash
# Terminal 4
curl http://localhost:3000/health | json_pp
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T...",
  "mode": "development",
  "webhook": null
}
```

### 3. Test Database Connection
```bash
# Terminal 2
node scripts/db-manager.js stats
```

**Expected Output:**
```
✅ Database connected successfully
📊 Database Statistics:
- Total Users: X
- Total Restaurants: X
- Total Businesses: X
- Total Hotels: X
```

### 4. Test Bot Commands (in Telegram)

#### Test Nigerian Features
```
1. /nigerian_food
   ✅ Should show 6 cuisine categories
   
2. Click "🍚 Jollof & Rice"
   ✅ Should search for Jollof restaurants
   
3. /food_lagos
   ✅ Should show Lagos restaurants
   
4. /food_abuja
   ✅ Should show Abuja restaurants
```

#### Test Marketplace
```
1. /search or Click 🛍️ Marketplace
   ✅ Should show search options
   
2. Click "📍 Share Location"
   ✅ Should prompt for location (mobile only)
   
3. Click "🏷️ Browse Categories"
   ✅ Should show 10 categories
   
4. Click "🔤 Search by Keyword"
   ✅ Type "electronics"
   ✅ Should show matching businesses
```

#### Test Hotels
```
1. /hotels
   ✅ Should show hotel menu
   
2. Click "🔍 Search Hotels"
   ✅ Type "Lagos"
   ✅ Should return hotels from RapidAPI
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot connect to database"
**Solution:**
```bash
# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection
node scripts/db-manager.js test

# If fails, check Railway dashboard
# https://railway.app/project/eb4be912-6283-47ee-a25c-0fd0a624a2d4
```

### Issue 2: "Bot not responding"
**Solution:**
```bash
# Check if bot is running
ps aux | grep node

# Check if webhook is interfering
# In .env, ensure: NODE_ENV=development

# Restart bot
npm start
```

### Issue 3: "Command not found"
**Solution:**
```bash
# Re-register commands
# Bot will auto-register on startup

# Or manually:
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setMyCommands" \
  -d '{"commands":[{"command":"start","description":"🏠 Main Menu"}]}'
```

### Issue 4: "Module not found"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for missing packages
npm list
```

---

## 📊 Monitoring Dashboard

### Watch These Metrics

**Terminal 1 (Bot Server):**
- ✅ "MidDexBot started successfully"
- ✅ "Waiting for messages..."
- ❌ Any error messages

**Terminal 2 (Database):**
- ✅ Connection pool active
- ✅ Query response times
- ❌ Connection timeouts

**Terminal 3 (Logs):**
- ✅ User interactions
- ✅ API responses
- ❌ Failed requests

**Telegram Bot:**
- ✅ Commands respond < 2 seconds
- ✅ Menus display correctly
- ❌ Buttons don't work

---

## 🚀 Deployment Checklist

Before deploying to Railway:

- [ ] All features tested locally
- [ ] No console errors
- [ ] Database queries optimized
- [ ] API keys verified
- [ ] Commands registered
- [ ] Nigerian features working
- [ ] Marketplace search working
- [ ] Hotels feature working
- [ ] Currency displays as ₦
- [ ] All buttons respond

**Deploy Command:**
```bash
git add -A
git commit -m "✨ Nigerian features + fixes"
git push origin main
# Railway auto-deploys from GitHub
```

---

## 🎯 Testing Priority

### High Priority (Test First)
1. ✅ Nigerian cuisine categories
2. ✅ City shortcuts (Lagos, Abuja, etc.)
3. ✅ Naira currency display
4. ✅ Marketplace search (3 methods)
5. ✅ Hotels with RapidAPI

### Medium Priority
6. Food ordering flow
7. Business registration
8. Restaurant registration
9. Order history

### Low Priority
10. Study hub features
11. Crypto features
12. Career tools

---

## 📞 Quick Reference

**Bot Token:** `8500626829:AAFgJNcO3FDFWmDNYHDJpaOmXOdb5jplDhU`  
**Bot Username:** `@MidDexBot`  
**Local URL:** `http://localhost:3000`  
**Railway URL:** `https://telegrambot-production-5661.up.railway.app`  
**GitHub:** `https://github.com/Mideweb001/MidDexBot-AI-Assistant`  
**Railway Dashboard:** `https://railway.app/project/eb4be912-6283-47ee-a25c-0fd0a624a2d4`

---

## 💡 Pro Tips

1. **Use VS Code Multi-cursor**
   - Cmd+D: Select next occurrence
   - Cmd+Shift+L: Select all occurrences
   - Alt+Click: Add cursor

2. **Quick File Navigation**
   - Cmd+P: Quick file open
   - Cmd+Shift+O: Go to symbol
   - Cmd+Click: Go to definition

3. **Terminal Shortcuts**
   - Ctrl+C: Stop process
   - Ctrl+Z: Suspend process
   - Ctrl+L: Clear terminal

4. **Git Workflow**
   ```bash
   git status           # Check changes
   git diff src/        # See changes
   git add src/server.js # Stage file
   git commit -m "msg"  # Commit
   git push             # Deploy
   ```

---

**Last Updated**: 2025-11-21  
**Status**: ✅ Ready for local testing  
**Next Step**: Open 4 terminals and start testing!
