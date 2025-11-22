# 🧪 Quick Testing Guide - Restaurant Features

## 🚀 How to Test Locally

### 1. Start the Bot
```bash
npm run dev
```

### 2. Open Telegram & Test Commands

#### Test 1: Browse by State
```
Send: /browse
Expected: State selection menu with 37 states
Tap: "Lagos"
Expected: List of restaurants in Lagos with ratings, distance, fees
```

#### Test 2: Location-Based Search
```
Send: /nearby
Expected: Request to share location
Action: Share your location
Expected: List of nearby restaurants sorted by distance
```

#### Test 3: Search Functionality
```
Send: /search jollof
Expected: Restaurants and menu items matching "jollof"
```

#### Test 4: View Restaurant Details
```
After browsing: Tap any restaurant button
Expected: 
- Restaurant info (name, rating, address, hours)
- Full menu by category
- Prices and availability
- Add to cart buttons
```

#### Test 5: Shopping Cart
```
Action: Tap "Add to Cart" on any menu item
Expected: Confirmation message with cart summary

Send: /cart
Expected:
- List of items in cart
- Quantities with +/- buttons
- Subtotal, tax, delivery fee, total
- Continue shopping or checkout buttons
```

#### Test 6: Cart Management
```
In cart view:
- Tap ➕ to increase quantity
- Tap ➖ to decrease quantity  
- Tap 🗑️ to remove item
- Tap ❌ Clear Cart to empty
Expected: Cart updates in real-time
```

#### Test 7: Checkout Flow
```
With items in cart: Tap "🛒 Checkout"
Expected: Request to share delivery location

Action: Share location
Expected:
- Order confirmation
- Order number
- Tracking link
- Cart cleared
```

#### Test 8: Order Tracking
```
After placing order:
Send: /track [order_id]
Expected:
- Current order status
- Progress bar (0-100%)
- ETA in minutes
- Rider info (when assigned)
- Order timeline
```

#### Test 9: Browse by Cuisine
```
Send: /cuisine
Expected: Cuisine type selection (Nigerian, Chinese, Italian, etc.)

Tap: "Nigerian"
Expected: List of Nigerian restaurants
```

#### Test 10: Active Orders
```
Send: /track (without order ID)
Expected: List of all active orders with track buttons
```

---

## ✅ Expected Results

### Restaurant List Should Show:
- ✅ Restaurant name
- ✅ Star rating (⭐⭐⭐⭐⭐)
- ✅ Cuisine type
- ✅ Distance (if location shared)
- ✅ Minimum order amount
- ✅ Delivery fee
- ✅ Open/closed status

### Restaurant Details Should Show:
- ✅ Full restaurant info
- ✅ Menu grouped by category
- ✅ Item names, descriptions, prices
- ✅ Availability status
- ✅ Add to cart buttons for each item

### Cart Should Show:
- ✅ Restaurant name
- ✅ Item list with quantities
- ✅ Price per item
- ✅ Subtotal
- ✅ Tax (8%)
- ✅ Delivery fee
- ✅ Total amount
- ✅ Minimum order warning (if not met)

### Order Tracking Should Show:
- ✅ Order number
- ✅ Current status with emoji
- ✅ Progress percentage
- ✅ Visual progress bar
- ✅ ETA in minutes
- ✅ Restaurant info
- ✅ Rider info (name, rating, phone)
- ✅ Timeline of all status changes

---

## 🐛 Common Issues & Solutions

### Issue: "No restaurants found"
**Solution**: 
- Make sure restaurants exist in database
- Check if restaurants have latitude/longitude
- Try different state or larger radius

### Issue: "Cart is empty"
**Solution**:
- Add items to cart first before viewing
- Cart is stored in memory - restart clears it
- Check if restaurant has menu items

### Issue: "Order not found"
**Solution**:
- Verify order ID is correct
- Check if order exists in database
- Use /track without ID to see active orders

### Issue: Location not working
**Solution**:
- Grant location permission in Telegram
- Try typing city name instead: /browse Lagos
- Check GPS is enabled on device

---

## 📊 Performance Benchmarks

### Response Times (Target)
- Command response: < 500ms
- Restaurant list: < 1s
- Cart operations: < 300ms
- Order tracking: < 800ms
- Location search: < 2s

### Load Testing
- Concurrent users: 100+
- Carts in memory: 1000+
- Database queries: < 100ms
- Distance calculations: < 50ms per restaurant

---

## 🎯 Testing Scenarios

### Scenario 1: First-Time User
```
1. /start → Welcome message
2. Tap "🍽️ Restaurants" → Restaurant menu
3. Tap "🗺️ Browse by State" → State list
4. Select "Lagos" → Restaurant list
5. Tap restaurant → Full details
6. Tap "Add to Cart" → Item added
7. Tap "View Cart" → Cart displayed
8. Tap "Checkout" → Location request
9. Share location → Order confirmed
10. Tap "Track Order" → Tracking displayed
```

### Scenario 2: Nearby Search
```
1. /nearby → Location request
2. Share location → Nearby restaurants
3. Select restaurant by distance
4. Add multiple items to cart
5. Modify quantities in cart
6. Checkout and track
```

### Scenario 3: Search & Filter
```
1. /search pizza → Results
2. Browse by cuisine "Italian" → Filtered list
3. Sort by rating/distance
4. Complete order
```

---

## 📝 Test Checklist

### Discovery Features
- [ ] `/browse` shows state selection
- [ ] `/browse Lagos` shows Lagos restaurants
- [ ] `/nearby` requests location
- [ ] Location sharing finds restaurants
- [ ] `/search` finds by keyword
- [ ] `/cuisine` shows cuisine types
- [ ] Distance calculated correctly
- [ ] Ratings display properly
- [ ] Open/closed status accurate

### Cart Features
- [ ] Add to cart works
- [ ] Cart displays items
- [ ] Quantity increase works
- [ ] Quantity decrease works
- [ ] Remove item works
- [ ] Clear cart works
- [ ] Subtotal calculates correctly
- [ ] Tax (8%) calculates correctly
- [ ] Delivery fee included
- [ ] Total calculates correctly
- [ ] Minimum order check works

### Checkout Features
- [ ] Checkout validates cart
- [ ] Location requested
- [ ] Order created
- [ ] Confirmation sent
- [ ] Order ID provided
- [ ] Cart cleared after order

### Tracking Features
- [ ] `/track [id]` shows order
- [ ] Status displayed correctly
- [ ] Progress bar accurate
- [ ] ETA calculated
- [ ] Rider info shown
- [ ] Timeline displayed
- [ ] Refresh works
- [ ] Active orders list works

### Edge Cases
- [ ] Empty cart handled
- [ ] Invalid order ID handled
- [ ] No restaurants found handled
- [ ] Minimum order not met handled
- [ ] Item unavailable handled
- [ ] Restaurant closed handled
- [ ] Out of delivery radius handled

---

## 🚀 Ready to Deploy?

### Pre-Deployment Checklist
- [x] All syntax errors fixed
- [x] Services integrated
- [x] Commands registered
- [x] Callbacks wired up
- [x] UI methods added
- [x] Error handling included
- [ ] Local testing completed
- [ ] Edge cases tested
- [ ] Performance verified

### Deployment Command
```bash
# Test locally first!
npm run dev

# Then deploy
git add .
git commit -m "feat: Complete restaurant discovery & ordering integration"
git push origin main

# Railway auto-deploys or:
railway up
```

---

## 🎉 Success Criteria

✅ All commands respond correctly  
✅ Restaurant browsing works (state, cuisine, location, search)  
✅ Cart operations functional (add, modify, remove)  
✅ Checkout completes successfully  
✅ Order tracking displays real-time info  
✅ UI is intuitive and responsive  
✅ No syntax or runtime errors  
✅ Performance meets benchmarks  

---

**Happy Testing! 🧪**

If you encounter any issues, check:
1. Console logs for errors
2. Database connections
3. Service initialization
4. Callback data formatting

Report issues in: `INTEGRATION-COMPLETE.md`
