# 🍽️ Restaurant Search Feature - Complete Guide

## ✅ Feature Overview

Your Telegram bot now has **location-based restaurant search** with the same powerful system used for hotels!

Users can find restaurants by:
- 📍 **GPS Location** - Share location for nearby results
- 🔤 **City Name** - Search by typing a location
- 🗺️ **Distance Sorting** - See closest restaurants first
- ⭐ **Ratings & Reviews** - Make informed decisions

## 🚀 How to Use

### Method 1: Location-Based Search (Recommended)

**Step 1:** Open Food Menu
```
User: Tap "🍽️ Food Delivery" in main menu
Bot: Shows food delivery options
```

**Step 2:** Start Search
```
User: Tap "🔍 Search Restaurants"
Bot: "Please share your location or type a city name"
```

**Step 3:** Share Location
```
User: Tap "📍 Share My Location"
Bot: "🔍 Finding restaurants near you..."
```

**Step 4:** View Results
```
Bot shows:
🟢 Restaurant Name
🍽️ Italian | ⭐⭐⭐⭐⭐ 4.5
📍 2.3 km away
🚚 Delivery: ₦500 • ⏱️ 30 min

[Tap restaurant to view menu]
```

### Method 2: Search by City

```
User: /search_restaurants Lagos
Bot: Shows restaurants in Lagos

OR

User: /search_restaurants Ikeja
Bot: Shows restaurants in Ikeja area
```

### Method 3: Browse All

```
User: /restaurants
Bot: Shows location sharing prompt
```

## 🎯 Features

### Smart Location System

**GPS-Based Search:**
- Share location → Bot finds nearby restaurants
- Calculates distance using Haversine formula
- Sorts results by proximity
- Shows distance in kilometers
- Search radius: 50km

**Reverse Geocoding:**
- Converts GPS coordinates → City name
- Shows: "Restaurants in Lagos" instead of coordinates
- Uses OpenStreetMap API (free)
- Fallback to "your location" if geocoding fails

**Distance Calculation:**
```
Formula: Haversine (great-circle distance)
Input: User lat/lon, Restaurant lat/lon
Output: Distance in km (e.g., "2.3 km away")
Sorting: Nearest first
```

### Restaurant Cards Display

Each result shows:
- 🟢/🔴 **Status:** Open or Closed
- ⭐ **Rating:** Visual stars + numeric rating
- 🍽️ **Cuisine:** Type of food
- 📍 **Location:** Distance or address
- 🚚 **Delivery:** Fee in Naira
- ⏱️ **Time:** Average preparation time

Example:
```
━━━━━━━━━━━━━━━━━━━━
🟢 Mama's Kitchen
🍽️ Nigerian | ⭐⭐⭐⭐ 4.2
📍 1.5 km away
🚚 Delivery: ₦300 • ⏱️ 25 min

🟢 Pizza Palace
🍽️ Italian | ⭐⭐⭐⭐⭐ 4.8
📍 3.2 km away
🚚 Delivery: ₦500 • ⏱️ 35 min
━━━━━━━━━━━━━━━━━━━━
```

### Detailed Restaurant View

Tap any restaurant to see:

**Header:**
- Restaurant name
- Status (Open/Closed)
- Rating with stars
- Cuisine type

**Details:**
- 📍 Full address
- 📞 Phone number (tap to call)
- 🚚 Delivery fee
- 💰 Minimum order amount
- ⏱️ Preparation time
- 📝 Description

**Menu Categories:**
- List of all available categories
- Item count per category
- Tap to view items

**Actions:**
- View Menu Categories
- Call Restaurant
- View on Google Maps
- View Cart
- Back to Results

## 📱 User Experience Flow

### Typical User Journey:

```
1. User opens bot
   ↓
2. Taps "🍽️ Food Delivery"
   ↓
3. Taps "🔍 Search Restaurants"
   ↓
4. Shares location OR types city
   ↓
5. Bot shows nearby restaurants with distances
   ↓
6. User taps a restaurant
   ↓
7. Bot shows full details + menu
   ↓
8. User browses menu categories
   ↓
9. User adds items to cart (coming soon)
   ↓
10. User places order (coming soon)
```

### Intent Detection

The bot intelligently handles location sharing:

```javascript
if (awaitingLocation === 'hotel_search') {
  // Search for hotels
} else if (awaitingLocation === 'restaurant_search') {
  // Search for restaurants  
} else {
  // Default to restaurant search
}
```

## 🔧 Technical Implementation

### Methods Added

**1. searchRestaurants(chatId, location)**
- Prompts for location if none provided
- Shows location sharing button
- Searches database by city/area name
- Displays results or "no results" message

**2. searchRestaurantsByLocation(chatId, latitude, longitude)**
- Performs reverse geocoding (coordinates → city)
- Gets nearby restaurants from database
- Calculates distance for each restaurant
- Sorts by distance (nearest first)
- Displays results with distance

**3. displayRestaurantResults(chatId, restaurants, location, showDistance)**
- Formats restaurant cards professionally
- Shows up to 8 restaurants with buttons
- Displays distance when using location
- Adds "New Search" and "Main Menu" buttons

**4. showRestaurantDetails(chatId, restaurantId)**
- Fetches restaurant from database
- Shows complete information
- Lists menu categories
- Provides Google Maps link
- Inline keyboard for actions

**5. showMenuCategory(chatId, restaurantId, category)**
- Filters menu items by category
- Shows item name, description, price
- Displays availability status
- "Add to Cart" buttons for available items

### Commands

**Primary Commands:**
```
/search_restaurants [city] - Search by location
/restaurants - Browse all restaurants
```

**Usage Examples:**
```
/search_restaurants Lagos
/search_restaurants Ikeja
/search_restaurants
```

### Callback Handlers

**Restaurant Callbacks:**
- `search_restaurants` → Start search
- `browse_restaurants` → Browse all
- `restaurant_menu_{id}` → View restaurant details
- `menu_category_{id}_{category}` → View category items
- `view_cart_{id}` → View shopping cart

### Integration Points

**FoodOrderService Integration:**
```javascript
// Get restaurants by location
await FoodOrderService.getRestaurantsByLocation(location)

// Get nearby restaurants (GPS)
await FoodOrderService.getNearbyRestaurants(latitude, longitude)

// Get restaurant details
await FoodOrderService.getRestaurantDetails(restaurantId)
```

**ConversationManager Integration:**
```javascript
// Set search intent
await this.conversationManager.setUserData(chatId, 'awaitingLocation', 'restaurant_search')

// Store user location
await this.conversationManager.setUserData(chatId, 'userLocation', {
  latitude, longitude, timestamp: Date.now()
})
```

## 📊 Comparison: Hotels vs Restaurants

Both features use the **same powerful location system**:

| Feature | Hotels | Restaurants |
|---------|--------|-------------|
| GPS Search | ✅ | ✅ |
| City Search | ✅ | ✅ |
| Distance Calc | ✅ | ✅ |
| Reverse Geocoding | ✅ | ✅ |
| Google Maps | ✅ | ✅ |
| Inline Keyboards | ✅ | ✅ |
| Professional Cards | ✅ | ✅ |
| Location Button | ✅ | ✅ |

## 🎨 User Interface

### Food Menu Updated

**Before:**
```
🍕 Restaurants | 🛒 Order Now
📦 My Orders | 🏪 Register
```

**After:**
```
🔍 Search Restaurants | 🍕 Browse All
📦 My Orders | 🏪 Register
```

### Location Request

```
🍽️ Restaurant Search

Please share your location or type a city name to find restaurants.

📍 Tap the button below to share your current location
🔤 Or type: /search_restaurants Lagos for a specific city

[📍 Share My Location]
```

### Results Display

```
🍽️ Restaurants in Lagos

Found 15 restaurants:

━━━━━━━━━━━━━━━━━━━━

🟢 Mama's Kitchen
🍽️ Nigerian | ⭐⭐⭐⭐ 4.2
📍 1.5 km away
🚚 Delivery: ₦300 • ⏱️ 25 min

🟢 Pizza Palace
🍽️ Italian | ⭐⭐⭐⭐⭐ 4.8
📍 3.2 km away
🚚 Delivery: ₦500 • ⏱️ 35 min

...and 13 more restaurants

[Mama's Kitchen] [Pizza Palace]
[Restaurant 3] [Restaurant 4]
[🔄 New Search] [🏠 Main Menu]
```

### Restaurant Details

```
🍽️ Pizza Palace

🟢 Open Now | ⭐⭐⭐⭐⭐ 4.8/5

━━━━━━━━━━━━━━━━━━━━

🍽️ Cuisine: Italian
📍 Location: 123 Victoria Island, Lagos
📞 Phone: +234 123 456 7890

💵 Pricing:
• Delivery Fee: ₦500
• Minimum Order: ₦2,000
• Preparation Time: 35 min

📝 About:
Authentic Italian pizzas and pasta made with fresh ingredients...

📋 Menu Categories: (5)
• Pizzas (12 items)
• Pasta (8 items)
• Appetizers (6 items)
• Desserts (4 items)
• Drinks (10 items)

[🍽️ Pizzas] [🍽️ Pasta]
[🍽️ Appetizers] [🍽️ Desserts]
[🛒 View Cart] [📞 Call]
[📍 View on Maps]
[🔙 Back to Results] [🏠 Main Menu]
```

## 🚀 Next Steps (Future Enhancements)

### Coming Soon:

**1. Shopping Cart System**
- Add items to cart
- Adjust quantities
- Remove items
- Calculate total

**2. Order Placement**
- Delivery address
- Payment options
- Order confirmation
- Real-time tracking

**3. Restaurant Reviews**
- Rate restaurants
- Write reviews
- See other reviews
- Filter by rating

**4. Advanced Filters**
- Filter by cuisine type
- Filter by price range
- Filter by delivery time
- Sort options

**5. Favorites**
- Save favorite restaurants
- Quick reorder
- Order history
- Recommendations

## 📈 Benefits

### For Users:
- ✅ Find restaurants easily
- ✅ See nearby options first
- ✅ Know exact distances
- ✅ Check availability before ordering
- ✅ Make informed decisions
- ✅ One-tap location sharing

### For Restaurant Owners:
- ✅ Increased visibility
- ✅ Location-based discovery
- ✅ Professional presence
- ✅ Direct customer connection
- ✅ Menu management
- ✅ Order management

## 🎊 Success!

Your bot now has **enterprise-grade restaurant search** powered by the same technology used for hotel search!

**What Users Can Do:**
- 🔍 Search any restaurant by location
- 📍 Find nearby restaurants instantly
- 🗺️ See distance and get directions
- ⭐ Check ratings before ordering
- 🍽️ Browse full menus
- 📞 Contact restaurants directly

**Status:** ✅ **LIVE AND OPERATIONAL**

Your users can start searching for restaurants **right now** using location or city names! 🍽️🎉
