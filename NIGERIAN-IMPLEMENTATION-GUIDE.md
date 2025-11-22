# 🇳🇬 Nigerian Food Delivery - Quick Implementation Guide

**Date**: November 21, 2025  
**Priority**: HIGH - Localize for Nigerian market  
**Timeline**: 1 week for Phase 1

---

## 🎯 PHASE 1: NIGERIAN LOCALIZATION (This Week)

### Day 1: Nigerian Cuisine Categories

Add to **src/server.js** in `showRestaurantCategories()`:

```javascript
async showRestaurantCategories(chatId) {
  const categories = [
    // Nigerian-specific
    { name: '🍚 Jollof & Rice', value: 'rice', emoji: '🍚' },
    { name: '🥘 Swallow & Soup', value: 'swallow', emoji: '🥘' },
    { name: '🍗 Suya & Proteins', value: 'proteins', emoji: '🍗' },
    { name: '🌮 Small Chops', value: 'smallchops', emoji: '🌮' },
    { name: '☕ Nigerian Breakfast', value: 'breakfast', emoji: '☕' },
    
    // International
    { name: '🍕 Fast Food', value: 'fastfood', emoji: '🍕' },
    { name: '🍜 Chinese', value: 'chinese', emoji: '🍜' },
    { name: '🍛 Indian', value: 'indian', emoji: '🍛' },
    { name: '🥗 Healthy Options', value: 'healthy', emoji: '🥗' },
    { name: '🍰 Desserts & Drinks', value: 'desserts', emoji: '🍰' }
  ];

  const keyboard = [];
  for (let i = 0; i < categories.length; i += 2) {
    const row = [
      { text: categories[i].name, callback_data: `restaurant_cat_${categories[i].value}` }
    ];
    if (i + 1 < categories.length) {
      row.push({ 
        text: categories[i + 1].name, 
        callback_data: `restaurant_cat_${categories[i + 1].value}` 
      });
    }
    keyboard.push(row);
  }

  keyboard.push([
    { text: '🔙 Back to Restaurants', callback_data: 'restaurants' },
    { text: '🏠 Main Menu', callback_data: 'main_menu' }
  ]);

  await this.bot.sendMessage(chatId, 
    '🇳🇬 *Nigerian Food Categories*\n\n' +
    'Choose your favorite cuisine:\n\n' +
    '🍚 Jollof, Fried Rice, Coconut Rice\n' +
    '🥘 Amala, Pounded Yam, Egusi, Ogbono\n' +
    '🍗 Suya, Asun, Peppered Chicken\n' +
    '🌮 Puff Puff, Meat Pie, Spring Rolls\n' +
    '☕ Akara, Moi Moi, Yam & Egg', 
    {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    }
  );
}
```

---

### Day 2: Nigerian City Shortcuts

Add new commands to **src/server.js**:

```javascript
// Nigerian city shortcuts
this.bot.onText(/\/food_lagos/, async (msg) => {
  const chatId = msg.chat.id;
  await this.searchRestaurantsByLocation(chatId, 6.5244, 3.3792); // Lagos coordinates
  await this.bot.sendMessage(chatId, '🍽️ *Lagos Restaurants*\n\nShowing food options in Lagos, Nigeria 🇳🇬');
});

this.bot.onText(/\/food_abuja/, async (msg) => {
  const chatId = msg.chat.id;
  await this.searchRestaurantsByLocation(chatId, 9.0765, 7.3986); // Abuja coordinates
  await this.bot.sendMessage(chatId, '🍽️ *Abuja Restaurants*\n\nShowing food options in Abuja, Nigeria 🇳🇬');
});

this.bot.onText(/\/food_portharcourt/, async (msg) => {
  const chatId = msg.chat.id;
  await this.searchRestaurantsByLocation(chatId, 4.8156, 7.0498); // PH coordinates
  await this.bot.sendMessage(chatId, '🍽️ *Port Harcourt Restaurants*\n\nShowing food options in Port Harcourt, Nigeria 🇳🇬');
});

// Cuisine shortcuts
this.bot.onText(/\/nigerian_food/, async (msg) => {
  const chatId = msg.chat.id;
  await this.bot.sendMessage(chatId, 
    '🇳🇬 *Nigerian Food Menu*\n\n' +
    'What would you like to eat?\n\n' +
    '🍚 /jollof_rice - Jollof & Rice dishes\n' +
    '🥘 /swallow - Swallow & Soup\n' +
    '🍗 /suya - Suya & Proteins\n' +
    '🌮 /smallchops - Small Chops\n' +
    '☕ /breakfast - Nigerian Breakfast\n\n' +
    'Or search by location: /food_lagos'
  );
});

this.bot.onText(/\/jollof_rice/, async (msg) => {
  const chatId = msg.chat.id;
  await this.searchRestaurantsByKeyword(chatId, 'jollof rice');
});

this.bot.onText(/\/swallow/, async (msg) => {
  const chatId = msg.chat.id;
  await this.searchRestaurantsByKeyword(chatId, 'swallow amala pounded yam');
});

this.bot.onText(/\/suya/, async (msg) => {
  const chatId = msg.chat.id;
  await this.searchRestaurantsByKeyword(chatId, 'suya asun grilled');
});
```

---

### Day 3: Nigerian Currency & Pricing

Update restaurant display to show Nigerian Naira (₦):

```javascript
async displayRestaurantResults(chatId, restaurants, title) {
  let message = `${title}\n\n`;
  
  restaurants.slice(0, 10).forEach((restaurant, index) => {
    message += `${index + 1}. 🏢 *${restaurant.name}*\n`;
    
    // Add price range in Naira
    const priceRange = restaurant.price_range || 2;
    const priceSymbol = '₦'.repeat(priceRange);
    message += `   💰 ${priceSymbol} (${this.getPriceRangeText(priceRange)})\n`;
    
    // Add delivery info
    if (restaurant.delivery_time) {
      message += `   ⏱️ ${restaurant.delivery_time} mins delivery\n`;
    }
    if (restaurant.delivery_fee) {
      message += `   🚚 ₦${restaurant.delivery_fee} delivery fee\n`;
    }
    
    // Add minimum order
    if (restaurant.minimum_order) {
      message += `   📦 Min order: ₦${restaurant.minimum_order}\n`;
    }
    
    message += `   📍 ${restaurant.address || 'Address not provided'}\n`;
    message += `   ⭐ Rating: ${restaurant.rating || 'Not rated'}/5.0\n`;
    message += `   /view_restaurant_${restaurant.id}\n\n`;
  });

  await this.bot.sendMessage(chatId, message, { 
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '🔙 Back', callback_data: 'restaurants' },
        { text: '🏠 Home', callback_data: 'main_menu' }
      ]]
    }
  });
}

getPriceRangeText(range) {
  const ranges = {
    1: '₦500-₦1,500 (Budget)',
    2: '₦1,500-₦3,500 (Mid-range)',
    3: '₦3,500+ (Premium)'
  };
  return ranges[range] || 'Price varies';
}
```

---

### Day 4: Time-Based Recommendations

Add smart Nigerian food suggestions:

```javascript
async getTimeBasedSuggestions(chatId) {
  const hour = new Date().getHours();
  let suggestion = '';

  if (hour >= 7 && hour < 10) {
    // Breakfast time
    suggestion = '🌅 *Good morning!*\n\n' +
      'Breakfast time! Try:\n' +
      '• Akara & Pap (₦800)\n' +
      '• Moi Moi & Bread (₦1,200)\n' +
      '• Yam & Egg (₦1,000)\n' +
      '• Pancakes & Tea (₦1,500)\n\n' +
      '/breakfast - See all breakfast options';
  } else if (hour >= 12 && hour < 15) {
    // Lunch time
    suggestion = '🍽️ *Lunch time!*\n\n' +
      'Popular lunch choices:\n' +
      '• Jollof Rice & Chicken (₦2,500)\n' +
      '• Fried Rice & Plantain (₦2,800)\n' +
      '• Amala & Ewedu (₦2,000)\n' +
      '• Pounded Yam & Egusi (₦3,500)\n\n' +
      '/jollof_rice - Order Jollof Rice now';
  } else if (hour >= 18 && hour < 22) {
    // Dinner time
    suggestion = '🌙 *Dinner time!*\n\n' +
      'Evening favorites:\n' +
      '• Suya Platter (₦3,000)\n' +
      '• Pepper Soup (₦2,500)\n' +
      '• Grilled Fish & Plantain (₦4,000)\n' +
      '• Ofada Rice & Stew (₦3,200)\n\n' +
      '/suya - Order Suya delivery';
  } else if (hour >= 22 || hour < 7) {
    // Late night
    suggestion = '🌃 *Late night cravings?*\n\n' +
      'Open 24/7:\n' +
      '• Sharwarma (₦2,000)\n' +
      '• Chicken & Chips (₦2,500)\n' +
      '• Pizza (₦3,500)\n' +
      '• Burgers (₦2,800)\n\n' +
      '/fastfood - See 24/7 options';
  }

  if (suggestion) {
    await this.bot.sendMessage(chatId, suggestion, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🍽️ Browse All Restaurants', callback_data: 'restaurants' },
          { text: '📍 Find Nearby', callback_data: 'search_by_location' }
        ]]
      }
    });
  }
}

// Call this when user accesses restaurant menu
async handleRestaurantsMenu(chatId) {
  await this.getTimeBasedSuggestions(chatId);
  // ... rest of restaurant menu code
}
```

---

### Day 5: Popular Nigerian Dishes Database

Add popular dishes to menu items:

```javascript
const popularNigerianDishes = {
  rice: [
    { name: 'Jollof Rice', price: 2500, description: 'Nigerian party favorite', spicy: true },
    { name: 'Fried Rice', price: 2800, description: 'With veggies and protein', spicy: false },
    { name: 'Coconut Rice', price: 3000, description: 'Sweet coconut flavor', spicy: false },
    { name: 'Ofada Rice', price: 3200, description: 'Local rice with designer stew', spicy: true }
  ],
  swallow: [
    { name: 'Pounded Yam & Egusi', price: 3500, description: 'Classic combo', spicy: false },
    { name: 'Amala & Ewedu', price: 2000, description: 'Yoruba specialty', spicy: false },
    { name: 'Eba & Ogbono', price: 2200, description: 'Draw soup with garri', spicy: false },
    { name: 'Fufu & Banga', price: 2800, description: 'Palm nut soup', spicy: true }
  ],
  proteins: [
    { name: 'Suya Platter', price: 3000, description: 'Spicy grilled meat', spicy: true },
    { name: 'Asun', price: 3500, description: 'Peppered goat meat', spicy: true },
    { name: 'Grilled Fish', price: 4000, description: 'Fresh tilapia/catfish', spicy: false },
    { name: 'Peppered Chicken', price: 2800, description: 'Fried chicken in pepper sauce', spicy: true }
  ],
  smallchops: [
    { name: 'Puff Puff', price: 500, description: 'Sweet fried dough balls', spicy: false },
    { name: 'Meat Pie', price: 800, description: 'Pastry with beef filling', spicy: false },
    { name: 'Samosa', price: 600, description: 'Fried triangular snack', spicy: false },
    { name: 'Spring Rolls', price: 700, description: 'Crispy vegetable rolls', spicy: false }
  ],
  breakfast: [
    { name: 'Akara & Pap', price: 800, description: 'Bean cakes with custard', spicy: false },
    { name: 'Moi Moi', price: 1000, description: 'Steamed bean pudding', spicy: false },
    { name: 'Yam & Egg', price: 1200, description: 'Fried yam with scrambled egg', spicy: false },
    { name: 'Plantain & Egg', price: 1000, description: 'Ripe plantain with eggs', spicy: false }
  ]
};

// Function to display popular dishes
async showPopularDishes(chatId, category) {
  const dishes = popularNigerianDishes[category] || [];
  
  let message = `🇳🇬 *Popular ${category.charAt(0).toUpperCase() + category.slice(1)} Dishes*\n\n`;
  
  dishes.forEach((dish, index) => {
    const spicyIcon = dish.spicy ? '🌶️' : '';
    message += `${index + 1}. *${dish.name}* ${spicyIcon}\n`;
    message += `   💰 ₦${dish.price.toLocaleString()}\n`;
    message += `   📝 ${dish.description}\n\n`;
  });

  message += '\n💡 These are example dishes. Actual menu varies by restaurant.';

  await this.bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '🔍 Find Restaurants', callback_data: `restaurant_cat_${category}` },
        { text: '🔙 Back', callback_data: 'restaurants' }
      ]]
    }
  });
}
```

---

### Day 6: Nigerian Payment Methods

Add payment method display:

```javascript
async showPaymentMethods(chatId, orderId) {
  const message = '💳 *Payment Methods*\n\n' +
    'Choose how you want to pay:\n\n' +
    '💵 Cash on Delivery (Pay rider)\n' +
    '💳 Card Payment (Paystack)\n' +
    '📱 Bank Transfer\n' +
    '🏦 USSD Payment\n' +
    '👛 MidDex Wallet (Coming soon)\n\n' +
    `Order Total: ₦${order.total.toLocaleString()}`;

  await this.bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '💵 Cash on Delivery', callback_data: `pay_cash_${orderId}` }],
        [{ text: '💳 Pay with Card', callback_data: `pay_card_${orderId}` }],
        [{ text: '📱 Bank Transfer', callback_data: `pay_transfer_${orderId}` }],
        [{ text: '🏦 USSD Payment', callback_data: `pay_ussd_${orderId}` }],
        [{ text: '❌ Cancel Order', callback_data: `cancel_order_${orderId}` }]
      ]
    }
  });
}
```

---

### Day 7: Nigerian Phone Format

Add proper Nigerian phone formatting:

```javascript
formatNigerianPhone(phone) {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('234')) {
    // International format: +234-xxx-xxx-xxxx
    return `+${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  } else if (cleaned.startsWith('0')) {
    // Local format: 0xxx-xxx-xxxx
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if format unknown
}

// Usage in restaurant display
async displayRestaurant(chatId, restaurant) {
  const phone = this.formatNigerianPhone(restaurant.phone);
  
  const message = `🏢 *${restaurant.name}*\n\n` +
    `📞 ${phone}\n` +
    `📍 ${restaurant.address}\n` +
    `⭐ ${restaurant.rating}/5.0 (${restaurant.review_count} reviews)\n` +
    `💰 ${this.getPriceRangeText(restaurant.price_range)}\n` +
    `⏱️ Delivery: ${restaurant.delivery_time} mins\n` +
    `🚚 Delivery fee: ₦${restaurant.delivery_fee}`;
  
  await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Launch:
- [ ] Test all Nigerian cuisine categories
- [ ] Verify Naira (₦) displays correctly
- [ ] Test city shortcuts (/food_lagos, /food_abuja)
- [ ] Test time-based suggestions
- [ ] Verify phone number formatting
- [ ] Test payment method display

### Launch Day:
- [ ] Commit changes to GitHub
- [ ] Deploy to Railway
- [ ] Test in production Telegram bot
- [ ] Verify all commands work
- [ ] Monitor error logs

### Post-Launch (Week 2):
- [ ] Collect user feedback
- [ ] Add more Nigerian cities
- [ ] Expand popular dishes list
- [ ] Add real payment integration (Paystack)
- [ ] Implement delivery tracking

---

## 📝 TESTING COMMANDS

Test these in @MidDexBot:

```
/restaurants - Main restaurant menu
/nigerian_food - Nigerian food categories
/food_lagos - Lagos restaurants
/food_abuja - Abuja restaurants
/jollof_rice - Search for Jollof Rice
/swallow - Search for Swallow
/suya - Search for Suya
/breakfast - Nigerian breakfast options
/smallchops - Small chops & snacks
```

---

## 🎯 SUCCESS METRICS

Track these after launch:

1. **Usage per category**:
   - How many users click "Jollof & Rice"?
   - Most popular cuisine type?

2. **City shortcuts**:
   - /food_lagos usage vs /food_abuja
   - Geographic distribution

3. **Time-based suggestions**:
   - Click-through rate on breakfast/lunch/dinner suggestions
   - Conversion to orders

4. **Popular dishes**:
   - Which dishes get viewed most?
   - Price range preferences

---

## 💡 NEXT PHASE IDEAS

### Week 2-3:
- [ ] Add restaurant photos (Nigerian dishes look amazing!)
- [ ] Implement user reviews in pidgin English
- [ ] Add "Bundle deals" (Jollof + Chicken + Drink = ₦4,000)
- [ ] Create "Owambe Menu" (party food packages)

### Month 2:
- [ ] Partner with real Nigerian restaurants
- [ ] Add Lagos traffic-aware delivery times
- [ ] Implement "Group order" for office lunches
- [ ] Add "Meal prep Monday" (order for the week)

### Month 3:
- [ ] Launch referral program ("Refer a friend, get ₦500")
- [ ] Add loyalty rewards ("Buy 10, get 1 free")
- [ ] Create "Student meal plans" (discounts for universities)
- [ ] Partner with food vendors at markets

---

**Status**: Ready to implement Nigerian localization  
**Timeline**: 7 days to Phase 1 completion  
**Impact**: 10x better user experience for Nigerian market  
**Next**: Start with Day 1 (Nigerian cuisine categories)

🇳🇬 **Let's make MidDexBot the #1 food delivery bot in Nigeria!**
