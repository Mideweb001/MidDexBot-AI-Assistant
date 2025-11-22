# 🔴 STEP-BY-STEP: Delete Exposed API Key

## Current Status: Google Cloud Console Opened ✅

You should now see the Google Cloud Console Credentials page in your browser.

---

## STEP 1: Find the Exposed API Key

**Look for this key in the list:**
```
AIzaSyA_emBvG-_Q1szvRUz9CiYEKdheJ06HHEI
```

**Visual Guide:**
```
┌─────────────────────────────────────────────────────────┐
│ API Keys                                        [+ Create]│
├─────────────────────────────────────────────────────────┤
│ Name                   | Key                    | Actions│
├─────────────────────────────────────────────────────────┤
│ API key 1             | AIzaSy...              | [⋮] ←  │
│ Browser key           | AIzaSy...              | [⋮]    │
│ Server key            | AIzaSy...              | [⋮]    │
└─────────────────────────────────────────────────────────┘
```

**Actions:**
1. ✅ Scroll through the list of API keys
2. ✅ Find the key starting with: `AIzaSyA_emBvG-_Q1szvRUz9CiYEKdheJ06HHEI`
3. ✅ Note the key name (you'll need this)

**Can you see the exposed key in the list?**
- [ ] Yes - Proceed to Step 2
- [ ] No - It may have been already deleted or restricted

---

## STEP 2: Delete the Exposed Key

**Option A: Delete from the List View**
```
1. Find the exposed key in the list
2. Click the three dots (⋮) menu on the right
3. Click "Delete"
4. Confirm deletion in the popup
```

**Option B: Delete from Key Details**
```
1. Click on the key name or key value
2. You'll see the key details page
3. Click "Delete" button at the top
4. Confirm deletion in the popup
```

**Confirmation Dialog:**
```
┌────────────────────────────────────────┐
│  Delete API Key?                       │
├────────────────────────────────────────┤
│  This API key will be permanently      │
│  deleted. This action cannot be undone.│
│                                        │
│  [Cancel]  [Delete]                    │
└────────────────────────────────────────┘
```

**Click "Delete" to confirm** ✅

---

## STEP 3: Create NEW Restricted API Key

**After deleting the old key:**

### 3.1 Create New Key
```
1. Click "+ Create Credentials" button at the top
2. Select "API key" from dropdown
3. A popup will show your new key
4. **IMMEDIATELY COPY THE KEY** (you'll need it soon)
```

**Popup will look like:**
```
┌────────────────────────────────────────┐
│  API key created                       │
├────────────────────────────────────────┤
│  Your API key is:                      │
│  ┌──────────────────────────────────┐ │
│  │ AIzaSy[NEW_KEY_HERE]             │ │
│  └──────────────────────────────────┘ │
│  [Copy] [Close]                        │
└────────────────────────────────────────┘
```

**Action:** Copy the new key and save it temporarily ✅

### 3.2 Restrict the Key (CRITICAL!)

**Click "Restrict Key" button in the popup, or:**
```
1. Find your new key in the list
2. Click on the key name
3. You'll see the "Edit API key" page
```

### 3.3 Set Application Restrictions

**Scroll to "Application restrictions" section:**
```
┌────────────────────────────────────────┐
│ Application restrictions               │
├────────────────────────────────────────┤
│ ○ None                                 │
│ ● HTTP referrers (web sites)           │ ← Select this
│ ○ IP addresses                         │
│ ○ Android apps                         │
│ ○ iOS apps                             │
└────────────────────────────────────────┘
```

**Select: "HTTP referrers (web sites)"**

**Add these referrers:**
```
┌────────────────────────────────────────┐
│ Website restrictions                   │
├────────────────────────────────────────┤
│ ┌──────────────────────────────────┐  │
│ │ *.railway.app/*                  │  │ ← Add this
│ └──────────────────────────────────┘  │
│ [+ Add an item]                        │
└────────────────────────────────────────┘
```

**Type:** `*.railway.app/*`
**Then click:** "+ Add an item"

### 3.4 Set API Restrictions

**Scroll to "API restrictions" section:**
```
┌────────────────────────────────────────┐
│ API restrictions                       │
├────────────────────────────────────────┤
│ ○ Don't restrict key                   │
│ ● Restrict key                         │ ← Select this
└────────────────────────────────────────┘
```

**Select: "Restrict key"**

**Search and enable ONLY these APIs:**
```
┌────────────────────────────────────────┐
│ Select APIs                            │
├────────────────────────────────────────┤
│ ☐ Search... [___________________]     │
│                                        │
│ ☑ Places API                          │ ← Check
│ ☑ Geocoding API                       │ ← Check  
│ ☑ Maps JavaScript API                 │ ← Check
│ ☐ Maps SDK for Android                │
│ ☐ Maps SDK for iOS                    │
│ ☐ [other APIs...]                     │
└────────────────────────────────────────┘
```

**Check ONLY:**
- ✅ Places API
- ✅ Geocoding API
- ✅ Maps JavaScript API

### 3.5 Save Changes

**Scroll to bottom and click:**
```
[Cancel]  [Save] ← Click here
```

**Wait for confirmation:**
```
✓ API key updated successfully
```

---

## STEP 4: Update Railway Environment

**Open a terminal and run:**

```bash
railway variables set GOOGLE_MAPS_API_KEY=YOUR_NEW_KEY_HERE
```

**Replace `YOUR_NEW_KEY_HERE` with the key you copied in Step 3.1**

**Example:**
```bash
# If your new key is AIzaSyBnEw...
railway variables set GOOGLE_MAPS_API_KEY=AIzaSyBnEw_KeyExample123456789
```

**Expected output:**
```
✓ Set environment variable GOOGLE_MAPS_API_KEY
```

---

## STEP 5: Update Local .env File

**Method 1: Using Command Line**
```bash
# Open .env in your editor
nano .env

# Find the line with GOOGLE_MAPS_API_KEY
# Replace the value with your new key
# Save and exit (Ctrl+X, then Y, then Enter)
```

**Method 2: Using VS Code**
```bash
# Open in VS Code
code .env

# Find: GOOGLE_MAPS_API_KEY=...
# Replace with your new key
# Save (Cmd+S)
```

**Your .env should look like:**
```bash
TELEGRAM_BOT_TOKEN=8500626829:AAF...
GOOGLE_MAPS_API_KEY=AIzaSyBnEw_YourNewKey123...  ← New key here
DATABASE_URL=postgresql://...
# ... other variables
```

**Verify .env is not tracked:**
```bash
git status
# Should NOT show .env in the list
```

---

## STEP 6: Test Everything Works

### 6.1 Restart Railway App
```bash
# Trigger a restart
railway up
```

Or click "Restart" in Railway dashboard.

### 6.2 Check Logs
```bash
railway logs --tail
```

**Look for:**
```
✅ MidDexBot started successfully
✅ Webhook set successfully
🚀 Bot is LIVE in production!
```

### 6.3 Test in Telegram

**Open your Telegram bot and:**

1. Type: `/start`
2. Click: "🍽️ Browse Restaurants"
3. Click: "📍 Share My Location" (or share manually)
4. Bot should respond with: "🔍 Finding restaurants near you..."
5. If database is populated, see restaurant list
6. If not populated, see: "No restaurants found" with alternatives

**Expected Success:**
```
🍽️ Restaurants Near You

📍 Found 12 restaurants

1. Jollof Palace
   ⭐⭐⭐⭐⭐ 4.5 • Nigerian
   📍 0.8km away
   💰 ₦450 delivery • Min: ₦1500
...
```

### 6.4 Test API Key Directly

**Optional - Verify new key works:**
```bash
curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=6.5244,3.3792&radius=1000&type=restaurant&key=YOUR_NEW_KEY_HERE"
```

**Should return JSON with status: "OK"**

---

## ✅ Completion Checklist

Mark each step as you complete it:

```
[ ] Step 1: Found exposed key in Google Cloud Console
[ ] Step 2: Deleted exposed key (confirmed in popup)
[ ] Step 3.1: Created new API key (copied key)
[ ] Step 3.2: Clicked "Restrict Key"
[ ] Step 3.3: Set HTTP referrers restriction
[ ] Step 3.4: Enabled only 3 APIs (Places, Geocoding, Maps JS)
[ ] Step 3.5: Clicked "Save" (saw success message)
[ ] Step 4: Updated Railway variables (saw ✓ success)
[ ] Step 5: Updated local .env file (verified not tracked)
[ ] Step 6.1: Restarted Railway app
[ ] Step 6.2: Checked logs (bot started successfully)
[ ] Step 6.3: Tested in Telegram (location sharing works)
[ ] Step 6.4: (Optional) Tested API key with curl
```

---

## 🎯 Success Criteria

**You're done when:**

1. ✅ Old key is deleted from Google Cloud Console
2. ✅ New restricted key is created and saved
3. ✅ Railway shows new key in environment variables
4. ✅ Local .env has new key
5. ✅ Bot works in Telegram
6. ✅ Location sharing finds restaurants (or shows proper fallback)

---

## ❌ Troubleshooting

### "Can't find the exposed key"
- It may have been auto-revoked by Google
- Check if there's a similar key name
- Proceed to create new key anyway

### "API key doesn't work after update"
```bash
# Check Railway has the new key
railway variables

# Should show:
# GOOGLE_MAPS_API_KEY: AIzaSy[new key]...
```

### "Bot not responding"
```bash
# Check Railway logs
railway logs --tail

# Look for errors related to API key
```

### "Restriction errors"
- Make sure you added `*.railway.app/*` to HTTP referrers
- Make sure you enabled Places API, Geocoding API, Maps JavaScript API
- Wait 1-2 minutes for changes to propagate

---

## 📞 Need Help?

**If stuck, check:**
1. Google Cloud Console: https://console.cloud.google.com/apis/credentials
2. Railway Dashboard: https://railway.app/dashboard
3. Logs: `railway logs --tail`

**Common issues documented in:**
- `SECURITY-INCIDENT.md`
- `URGENT-SECURITY-ACTIONS.md`

---

**Time estimate:** 10-15 minutes total
**Current step:** Step 1 (Find and delete exposed key)
**Browser opened:** ✅ Yes

**👉 Start with Step 1 above and work through each step carefully!**
