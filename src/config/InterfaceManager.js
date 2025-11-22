/**
 * Modern Interface Manager
 * Handles all UI interactions with the new glass bitmoji design system
 */

const ModernUX = require('./ModernUX');

class InterfaceManager {
  
  /**
   * Generate main menu message with modern layout
   */
  static getMainMenuMessage(firstName = 'there') {
    const { messages, categories } = ModernUX;
    const { welcome } = messages;
    
    let message = `👋 Hello ${firstName}!\n`;
    message += `✨ Your DexBot AI-Powered Super Assistant\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `🛍️ **Marketplace** - Local businesses & services\n`;
    message += `🍽️ **Restaurants** - Discover & order food\n`;
    message += `🏨 **Hotels** - Book amazing stays\n`;
    message += `📚 **Study Hub** - AI-powered learning\n`;
    message += `💼 **Career Tools** - Professional growth\n`;
    message += `💰 **Crypto Trading** - Track and trade\n`;
    message += `🎯 **Quick Actions** - Fast access\n\n`;
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💡 Tap a button below to get started`;
    
    return message;
  }

  /**
   * Generate main menu keyboard with organized categories
   */
  static getMainMenuKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🛍️ Marketplace', callback_data: 'menu_marketplace' },
          { text: '🍽️ Restaurants', callback_data: 'menu_restaurants' }
        ],
        [
          { text: '🏨 Hotels', callback_data: 'menu_hotels' },
          { text: '� Study Hub', callback_data: 'menu_study' }
        ],
        [
          { text: '� Career Tools', callback_data: 'menu_career' },
          { text: '💰 Crypto Trading', callback_data: 'menu_crypto' }
        ],
        [
          { text: '� Quick Actions', callback_data: 'menu_quick' },
          { text: '💡 Help', callback_data: 'show_help' }
        ]
      ]
    };
  }

  /**
   * Generate marketplace hub menu (businesses only - NOT restaurants or hotels)
   */
  static getMarketplaceMenu() {
    let message = `🛍️ *Business Marketplace*\n`;
    message += `Find Local Businesses & Services\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `🔍 *Search & Discover*\n`;
    message += `   • Find businesses by location\n`;
    message += `   • Browse by category\n`;
    message += `   • Search by keyword\n\n`;
    
    message += `🏬 *Business Owner?*\n`;
    message += `   • Register your business\n`;
    message += `   • Manage listings\n`;
    message += `   • Track orders\n\n`;
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📊 *Categories:*\n`;
    message += `🛒 Supermarkets • 👗 Fashion • 📱 Electronics\n`;
    message += `💊 Pharmacy • 🏥 Healthcare • 🏋️ Fitness\n`;
    message += `💇 Beauty • 🏠 Home & Garden • 🎓 Education\n\n`;
    
    message += `💡 _Use buttons below or share your location_`;
    
    return message;
  }

  /**
   * Generate restaurants hub menu (completely separate from marketplace)
   */
  static getRestaurantsMenu() {
    let message = `🍽️ *Restaurant Hub*\n`;
    message += `Discover & Order Delicious Meals\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `🔍 *Find Restaurants*\n`;
    message += `   • Search by location\n`;
    message += `   • Browse by cuisine\n`;
    message += `   • Nigerian specialties\n\n`;
    
    message += `🛒 *Order Food*\n`;
    message += `   • View menus\n`;
    message += `   • Place orders\n`;
    message += `   • Track delivery\n\n`;
    
    message += `🏪 *Restaurant Owner?*\n`;
    message += `   • Register restaurant\n`;
    message += `   • Manage menu\n`;
    message += `   • Track orders\n\n`;
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `🍕 *Popular Cuisines:*\n`;
    message += `🇳🇬 Nigerian • 🍕 Fast Food • 🍜 Asian\n`;
    message += `🍝 Italian • 🍔 Burgers • 🌮 Mexican\n`;
    message += `🥗 Healthy • 🍰 Desserts • ☕ Cafes\n\n`;
    
    message += `💡 _Share location for nearby restaurants_`;
    
    return message;
  }

  /**
   * Legacy method - redirects to getRestaurantsMenu
   * @deprecated Use getRestaurantsMenu() instead
   */
  static getFoodDeliveryMenu() {
    return this.getRestaurantsMenu();
  }

  /**
   * Generate study hub menu with sections
   */
  static getStudyHubMenu() {
    const { study } = ModernUX;
    
    let message = `${study.main.title}\n`;
    message += `${study.main.subtitle}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    study.main.sections.forEach(section => {
      message += `${section.emoji} *${section.name}*\n`;
      section.actions.forEach(action => {
        message += `  ${action.emoji} ${action.label} - ${action.command}\n`;
      });
      message += `\n`;
    });
    
    return message;
  }

  /**
   * Generate career tools menu
   */
  static getCareerToolsMenu() {
    const { career } = ModernUX;
    
    let message = `${career.main.title}\n`;
    message += `${career.main.subtitle}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    career.main.sections.forEach(section => {
      message += `${section.emoji} *${section.name}*\n`;
      section.actions.forEach(action => {
        message += `  ${action.emoji} ${action.label} - ${action.command}\n`;
      });
      message += `\n`;
    });
    
    return message;
  }

  /**
   * Generate crypto trading hub menu
   */
  static getCryptoTradingMenu() {
    const { crypto } = ModernUX;
    
    let message = `${crypto.main.title}\n`;
    message += `${crypto.main.subtitle}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    crypto.main.sections.forEach(section => {
      message += `${section.emoji} *${section.name}*\n`;
      section.actions.forEach(action => {
        message += `  ${action.emoji} ${action.label} - ${action.command}\n`;
      });
      message += `\n`;
    });
    
    return message;
  }

  /**
   * Generate quick actions menu
   */
  static getQuickActionsMenu() {
    const { quick } = ModernUX;
    
    let message = `${quick.main.title}\n`;
    message += `${quick.main.subtitle}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    quick.main.actions.forEach((action, index) => {
      message += `${action.emoji} *${action.label}* - ${action.command}\n`;
      if ((index + 1) % 4 === 0) message += `\n`;
    });
    
    return message;
  }

  /**
   * Generate hotel booking menu (completely separate from restaurants/marketplace)
   */
  static getHotelsMenu() {
    let message = `🏨 *Hotel Booking Hub*\n`;
    message += `Find & Book Amazing Stays Worldwide\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `🔍 *Search Hotels*\n`;
    message += `   • Search by city/location\n`;
    message += `   • Filter by price & rating\n`;
    message += `   • View photos & reviews\n\n`;
    
    message += `📅 *Book & Manage*\n`;
    message += `   • Easy booking process\n`;
    message += `   • My bookings\n`;
    message += `   • Write reviews\n\n`;
    
    message += `🏢 *Hotel Owner?*\n`;
    message += `   • Register hotel\n`;
    message += `   • Manage property\n`;
    message += `   • Track bookings\n\n`;
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `🌍 *Global Coverage:*\n`;
    message += `🇳🇬 Nigeria (All 36 States + FCT)\n`;
    message += `🌍 Africa • 🌎 Americas • 🌏 Asia\n`;
    message += `🇪🇺 Europe • 🏝️ Pacific Islands\n\n`;
    
    message += `🏆 *28M+ Hotels Worldwide*\n`;
    message += `💡 _Search now or share your location_`;
    
    return message;
  }

  /**
   * Generate inline keyboard for section navigation
   */
  static getSectionKeyboard(section) {
    const { buttons } = ModernUX;
    
    const keyboard = {
      inline_keyboard: []
    };

    // Add section-specific buttons
    if (section === 'marketplace') {
      keyboard.inline_keyboard = [
        [
          { text: '� Search Businesses', callback_data: 'search_businesses' },
          { text: '�️ Categories', callback_data: 'business_categories' }
        ],
        [
          { text: '📍 Near Me', callback_data: 'businesses_near_me' },
          { text: '🛒 My Orders', callback_data: 'my_marketplace_orders' }
        ],
        [
          { text: '�🏬 My Business', callback_data: 'my_business' },
          { text: '➕ Register', callback_data: 'register_business' }
        ],
        [buttons.home]
      ];
    } else if (section === 'restaurants') {
      keyboard.inline_keyboard = [
        [
          { text: '� Browse by State', callback_data: 'restaurant_states_page_0' },
          { text: '🔍 Search', callback_data: 'search_restaurants' }
        ],
        [
          { text: '�️ Near Me', callback_data: 'restaurants_near_me' },
          { text: '� By Cuisine', callback_data: 'browse_cuisines' }
        ],
        [
          { text: '🛒 My Orders', callback_data: 'my_food_orders' },
          { text: '⭐ Top Rated', callback_data: 'top_rated_restaurants' }
        ],
        [
          { text: '🏪 Register Restaurant', callback_data: 'register_restaurant' },
          { text: '⚙️ Manage', callback_data: 'manage_restaurant' }
        ],
        [buttons.home]
      ];
    } else if (section === 'food') {
      // Legacy support - redirect to restaurants
      keyboard.inline_keyboard = [
        [
          { text: '🔍 Search Restaurants', callback_data: 'search_restaurants' },
          { text: '🍕 Browse All', callback_data: 'browse_restaurants' }
        ],
        [
          { text: '📦 My Orders', callback_data: 'my_food_orders' },
          { text: '🏪 Register', callback_data: 'register_restaurant' }
        ],
        [buttons.home]
      ];
    } else if (section === 'study') {
      keyboard.inline_keyboard = [
        [
          { text: '🔍 Research', callback_data: 'research_tool' },
          { text: '📝 Notes', callback_data: 'smart_notes' }
        ],
        [
          { text: '✏️ Homework', callback_data: 'homework_help' },
          { text: '👥 Groups', callback_data: 'study_groups' }
        ],
        [
          { text: '⏱️ Timer', callback_data: 'study_timer' },
          { text: '📅 Events', callback_data: 'events_calendar' }
        ],
        [buttons.home]
      ];
    } else if (section === 'career') {
      keyboard.inline_keyboard = [
        [
          { text: '📄 Analyze CV', callback_data: 'analyze_cv' },
          { text: '✨ Improve CV', callback_data: 'improve_cv' }
        ],
        [
          { text: '📊 ATS Score', callback_data: 'ats_score' },
          { text: '✉️ Cover Letter', callback_data: 'cover_letter' }
        ],
        [
          { text: '📚 Courses', callback_data: 'find_courses' },
          { text: '🎥 Webinars', callback_data: 'find_webinars' }
        ],
        [buttons.home]
      ];
    } else if (section === 'crypto') {
      keyboard.inline_keyboard = [
        [
          { text: '💎 Prices', callback_data: 'crypto_prices' },
          { text: '📰 News', callback_data: 'crypto_news' }
        ],
        [
          { text: '🟢 Buy', callback_data: 'buy_crypto' },
          { text: '🔴 Sell', callback_data: 'sell_crypto' }
        ],
        [
          { text: '💼 Portfolio', callback_data: 'crypto_portfolio' },
          { text: '⏰ Alerts', callback_data: 'crypto_alerts' }
        ],
        [buttons.home]
      ];
    } else if (section === 'hotels') {
      keyboard.inline_keyboard = [
        [
          { text: '🔍 Search Hotels', callback_data: 'search_hotels' },
          { text: '🌍 By Location', callback_data: 'hotels_by_location' }
        ],
        [
          { text: '📍 Near Me', callback_data: 'hotels_near_me' },
          { text: '⭐ Top Rated', callback_data: 'hotels_top_rated' }
        ],
        [
          { text: '📅 My Bookings', callback_data: 'my_hotel_bookings' },
          { text: '⭐ Write Review', callback_data: 'write_hotel_review' }
        ],
        [
          { text: '🏢 Register Hotel', callback_data: 'register_hotel' },
          { text: '💼 Manage', callback_data: 'manage_hotels' }
        ],
        [buttons.home]
      ];
    } else {
      // Default quick actions keyboard
      keyboard.inline_keyboard = [
        [buttons.home, buttons.help]
      ];
    }

    return keyboard;
  }

  /**
   * Format success message
   */
  static formatSuccess(message) {
    const { messages } = ModernUX;
    return `${messages.success.emoji} *${messages.success.prefix}*\n\n${message}`;
  }

  /**
   * Format error message
   */
  static formatError(message) {
    const { messages } = ModernUX;
    return `${messages.error.emoji} *${messages.error.prefix}*\n\n${message}`;
  }

  /**
   * Format loading message
   */
  static formatLoading(message) {
    const { messages } = ModernUX;
    return `${messages.loading.emoji} *${messages.loading.prefix}*\n\n${message}`;
  }

  /**
   * Format info message
   */
  static formatInfo(message) {
    const { messages } = ModernUX;
    return `${messages.info.emoji} *${messages.info.prefix}*\n\n${message}`;
  }

  /**
   * Get status emoji for marketplace orders
   */
  static getMarketplaceStatusEmoji(status) {
    const { marketplace } = ModernUX;
    return marketplace.statuses[status]?.emoji || '🛍️';
  }

  /**
   * Get status emoji for food orders
   */
  static getFoodStatusEmoji(status) {
    const { food } = ModernUX;
    return food.statuses[status]?.emoji || '📦';
  }

  /**
   * Generate comprehensive help menu
   */
  static getHelpMenu() {
    let message = `💡 *MidDexBot Help Center*\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `🛍️ *Marketplace Commands*\n`;
    message += `/search - Find local businesses\n`;
    message += `/registerbusiness - List your business\n`;
    message += `/mybusiness - Manage your listings\n`;
    message += `/myorders - Track marketplace orders\n\n`;
    
    message += `🍽️ *Restaurant Commands*\n`;
    message += `/restaurants - Browse restaurants\n`;
    message += `/search_restaurants - Find by location\n`;
    message += `/orderfood - Place food order\n`;
    message += `/orders - View food order history\n`;
    message += `/registerrestaurant - Add restaurant\n\n`;
    
    message += `� *Hotel Commands*\n`;
    message += `/hotels - Hotel booking hub\n`;
    message += `/search_hotels - Find hotels\n`;
    message += `/my_bookings - View bookings\n`;
    message += `/registerhotel - Register hotel\n`;
    message += `/review_hotel - Write review\n\n`;
    
    message += `📚 *Study Commands*\n`;
    message += `/research - Research assistant\n`;
    message += `/notes - Smart notes creator\n`;
    message += `/homework - Homework help\n`;
    message += `/study - Study planning\n`;
    message += `/timer - Study timer\n`;
    message += `/studygroup - Study groups\n\n`;
    
    message += `💼 *Career Commands*\n`;
    message += `/analyze - Analyze CV/Resume\n`;
    message += `/improve - Enhance CV content\n`;
    message += `/cover - Generate cover letter\n`;
    message += `/score - Get ATS score\n`;
    message += `/courses - Find courses\n\n`;
    
    message += `💰 *Crypto Commands*\n`;
    message += `/crypto - Track prices\n`;
    message += `/cryptonews - Latest news\n`;
    message += `/cryptoalert - Set alerts\n`;
    message += `/buy - Buy cryptocurrency\n`;
    message += `/sell - Sell cryptocurrency\n`;
    message += `/inventory - View portfolio\n\n`;
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💡 _Tip: Use menu buttons for easy navigation!_`;
    
    return message;
  }

  /**
   * Generate state selection menu for restaurant browsing
   */
  static getStateSelectionMenu() {
    const states = [
      ['Lagos', 'Abuja', 'Rivers'],
      ['Oyo', 'Kano', 'Kaduna'],
      ['Enugu', 'Anambra', 'Delta'],
      ['Edo', 'Ogun', 'Ondo'],
      ['Plateau', 'Cross River', 'Akwa Ibom'],
      ['Imo', 'Osun', 'Kwara'],
      ['Benue', 'Niger', 'Bauchi']
    ];

    let message = `🗺️ *Browse Restaurants by State*\n\n`;
    message += `Select a state to discover restaurants:\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    const allStates = states.flat();
    allStates.forEach((state, index) => {
      if (index % 3 === 0 && index > 0) message += `\n`;
      message += `📍 ${state}  `;
    });
    
    message += `\n\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💡 _Or share your location for nearby restaurants_`;

    return { message, states };
  }

  /**
   * Format restaurant list display
   */
  static formatRestaurantList(restaurants, userLocation = null) {
    if (!restaurants || restaurants.length === 0) {
      return `😕 *No restaurants found*\n\nTry adjusting your search criteria or check back later!`;
    }

    let message = `🍽️ *${restaurants.length} Restaurant${restaurants.length > 1 ? 's' : ''} Found*\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    restaurants.forEach((restaurant, index) => {
      message += `${index + 1}. *${restaurant.name}*\n`;
      message += `   ${this.getRatingStars(restaurant.rating)} (${restaurant.rating || 'New'})\n`;
      message += `   🍴 ${restaurant.cuisine_type || 'Various cuisines'}\n`;
      
      if (restaurant.distance !== undefined) {
        message += `   📍 ${restaurant.distance.toFixed(1)} km away\n`;
      }
      
      message += `   💰 Min Order: ₦${restaurant.minimum_order || 0}\n`;
      message += `   🚚 Delivery: ₦${restaurant.delivery_fee || 0}\n`;
      
      if (restaurant.operating_hours) {
        const isOpen = this.checkIfOpen(restaurant.operating_hours);
        message += `   ${isOpen ? '✅ Open Now' : '⏰ Closed'}\n`;
      }
      
      message += `\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💡 _Tap a restaurant to view menu_`;

    return message;
  }

  /**
   * Format restaurant details with full menu
   */
  static formatRestaurantDetails(restaurant, menu, userLocation = null) {
    let message = `🏪 *${restaurant.name}*\n\n`;
    
    message += `${this.getRatingStars(restaurant.rating)} ${restaurant.rating || 'New'} Rating\n`;
    message += `🍴 ${restaurant.cuisine_type || 'Various cuisines'}\n`;
    
    if (restaurant.distance !== undefined) {
      message += `📍 ${restaurant.distance.toFixed(1)} km away\n`;
    }
    
    message += `📞 ${restaurant.phone || 'Not available'}\n`;
    message += `📍 ${restaurant.address || 'Address not available'}\n\n`;
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `💰 *Pricing Info*\n`;
    message += `   • Min Order: ₦${restaurant.minimum_order || 0}\n`;
    message += `   • Delivery Fee: ₦${restaurant.delivery_fee || 0}\n`;
    message += `   • Delivery Radius: ${restaurant.delivery_radius || 10} km\n\n`;
    
    if (restaurant.operating_hours) {
      const isOpen = this.checkIfOpen(restaurant.operating_hours);
      message += `⏰ *Status*: ${isOpen ? '✅ Open Now' : '🔴 Closed'}\n\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Display menu by category
    if (menu && menu.length > 0) {
      message += `📋 *Menu*\n\n`;
      
      const categories = {};
      menu.forEach(item => {
        const category = item.category || 'Other';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(item);
      });
      
      Object.keys(categories).forEach(category => {
        message += `🏷️ *${category}*\n`;
        categories[category].forEach(item => {
          const available = item.available !== false ? '✅' : '❌';
          message += `   ${available} ${item.name} - ₦${item.price}\n`;
          if (item.description) {
            message += `      _${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}_\n`;
          }
        });
        message += `\n`;
      });
    } else {
      message += `📋 Menu not available yet\n\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `🛒 _Tap menu items to add to cart_`;

    return message;
  }

  /**
   * Format shopping cart display
   */
  static formatShoppingCart(cart) {
    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        message: `🛒 *Your Cart is Empty*\n\n` +
                `Browse restaurants and add items to get started!\n\n` +
                `💡 _Use the restaurants menu to find delicious meals_`,
        hasItems: false
      };
    }

    let message = `🛒 *Your Cart*\n\n`;
    message += `🏪 ${cart.restaurant_name}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    cart.items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* x${item.quantity}\n`;
      message += `   ₦${item.price} each = ₦${item.price * item.quantity}\n`;
      
      if (item.customizations && Object.keys(item.customizations).length > 0) {
        message += `   📝 `;
        Object.entries(item.customizations).forEach(([key, value]) => {
          message += `${key}: ${value}, `;
        });
        message = message.slice(0, -2) + `\n`;
      }
      message += `\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💵 *Order Summary*\n`;
    message += `   Subtotal: ₦${cart.subtotal.toFixed(2)}\n`;
    message += `   Tax (8%): ₦${cart.tax.toFixed(2)}\n`;
    message += `   Delivery: ₦${cart.delivery_fee.toFixed(2)}\n`;
    message += `   ━━━━━━━━━━━━\n`;
    message += `   *Total: ₦${cart.total.toFixed(2)}*\n\n`;
    
    if (!cart.meets_minimum) {
      const needed = cart.minimum_order - cart.subtotal;
      message += `⚠️ Add ₦${needed.toFixed(2)} more to meet minimum order\n\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💡 _Modify quantities or proceed to checkout_`;

    return {
      message,
      hasItems: true,
      meetsMinimum: cart.meets_minimum,
      total: cart.total
    };
  }

  /**
   * Format order tracking display
   */
  static formatOrderTracking(tracking) {
    let message = `📦 *Order #${tracking.order.order_number || tracking.order.id}*\n\n`;
    
    const statusEmojis = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '📦',
      picked_up: '🏍️',
      nearby: '📍',
      delivered: '🎉',
      cancelled: '❌'
    };
    
    const currentEmoji = statusEmojis[tracking.status] || '📋';
    message += `${currentEmoji} *Status:* ${tracking.status_message}\n`;
    message += `⏱️ *ETA:* ${tracking.eta} minutes\n`;
    message += `📊 *Progress:* ${tracking.progress}%\n\n`;
    
    // Progress bar
    const progressBars = Math.floor(tracking.progress / 10);
    const emptyBars = 10 - progressBars;
    message += `[${'█'.repeat(progressBars)}${'░'.repeat(emptyBars)}]\n\n`;
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Restaurant info
    message += `🏪 *${tracking.restaurant_name}*\n`;
    message += `📍 ${tracking.restaurant_address}\n\n`;
    
    // Rider info (if assigned)
    if (tracking.rider) {
      message += `🏍️ *Your Rider*\n`;
      message += `   👤 ${tracking.rider.name}\n`;
      message += `   ⭐ ${tracking.rider.rating} (${tracking.rider.total_deliveries} deliveries)\n`;
      message += `   📞 ${tracking.rider.phone}\n\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Timeline
    if (tracking.timeline && tracking.timeline.length > 0) {
      message += `📋 *Order Timeline*\n\n`;
      tracking.timeline.forEach(event => {
        const emoji = statusEmojis[event.status] || '•';
        const timestamp = new Date(event.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        message += `${emoji} ${event.message}\n`;
        message += `   ${timestamp}\n\n`;
      });
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    if (tracking.status === 'delivered') {
      message += `🎉 *Order Delivered!*\n`;
      message += `Thank you for your order!\n\n`;
      message += `💡 _Please rate your experience_`;
    } else if (tracking.status === 'cancelled') {
      message += `❌ *Order Cancelled*\n`;
      message += `${tracking.cancellation_reason || 'No reason provided'}\n`;
    } else {
      message += `💡 _Tracking updates automatically_`;
    }

    return message;
  }

  /**
   * Format cuisine type selection menu
   */
  static getCuisineSelectionMenu() {
    const cuisines = [
      ['🇳🇬 Nigerian', '🍕 Fast Food', '🍜 Asian'],
      ['🍝 Italian', '🍔 Burgers', '🌮 Mexican'],
      ['🥗 Healthy', '🍰 Desserts', '☕ Cafes'],
      ['🍗 BBQ', '🍱 Japanese', '🥙 Lebanese'],
      ['🥘 Indian', '🍤 Seafood', '🥩 Steakhouse']
    ];

    let message = `🍴 *Browse by Cuisine*\n\n`;
    message += `Select your favorite cuisine type:\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    cuisines.flat().forEach(cuisine => {
      message += `${cuisine}\n`;
    });
    
    message += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💡 _Discover restaurants serving your favorite food_`;

    return { message, cuisines };
  }

  /**
   * Helper: Get rating stars
   */
  static getRatingStars(rating) {
    if (!rating) return '⭐ New';
    const stars = Math.round(rating);
    return '⭐'.repeat(Math.min(stars, 5));
  }

  /**
   * Helper: Check if restaurant is open
   */
  static checkIfOpen(operatingHours) {
    try {
      if (!operatingHours) return false;
      
      const now = new Date();
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;
      
      const hours = typeof operatingHours === 'string' ? JSON.parse(operatingHours) : operatingHours;
      const todayHours = hours[dayOfWeek];
      
      if (!todayHours || todayHours.closed) return false;
      
      const [openHour, openMinute] = todayHours.open.split(':').map(Number);
      const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);
      const openTime = openHour * 60 + openMinute;
      const closeTime = closeHour * 60 + closeMinute;
      
      return currentTime >= openTime && currentTime <= closeTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate keyboard for cart items
   */
  static getCartItemsKeyboard(items) {
    const keyboard = [];
    
    items.forEach((item, index) => {
      keyboard.push([
        { text: `➖ ${item.name}`, callback_data: `cart_decrease_${index}` },
        { text: `${item.quantity}`, callback_data: `cart_view_${index}` },
        { text: `➕`, callback_data: `cart_increase_${index}` },
        { text: `🗑️`, callback_data: `cart_remove_${index}` }
      ]);
    });
    
    keyboard.push([
      { text: '🏠 Continue Shopping', callback_data: 'cart_continue' },
      { text: '🛒 Checkout', callback_data: 'cart_checkout' }
    ]);
    
    keyboard.push([
      { text: '❌ Clear Cart', callback_data: 'cart_clear' },
      { text: '🏠 Main Menu', callback_data: 'menu_main' }
    ]);
    
    return { inline_keyboard: keyboard };
  }

  // ===== HOTEL BOOKING UI METHODS =====

  /**
   * Get hotel state selection menu (Nigerian states)
   */
  static getHotelStateSelectionMenu() {
    const HotelDiscoveryService = require('../services/HotelDiscoveryService');
    const states = HotelDiscoveryService.getAllStates();
    
    const keyboard = [];
    
    // Create rows of 2 states each
    for (let i = 0; i < states.length; i += 2) {
      const row = [];
      row.push({ 
        text: `📍 ${states[i]}`, 
        callback_data: `hotel_state_${states[i]}` 
      });
      
      if (i + 1 < states.length) {
        row.push({ 
          text: `📍 ${states[i + 1]}`, 
          callback_data: `hotel_state_${states[i + 1]}` 
        });
      }
      
      keyboard.push(row);
    }
    
    // Add back button
    keyboard.push([
      { text: '🔙 Back to Hotels', callback_data: 'menu_hotels' },
      { text: '🏠 Main Menu', callback_data: 'main_menu' }
    ]);
    
    return {
      message: '🏨 *Browse Hotels by State*\n\n' +
               'Select a Nigerian state to see available hotels:\n\n' +
               '━━━━━━━━━━━━━━━━━━━━',
      keyboard: { inline_keyboard: keyboard }
    };
  }

  /**
   * Get city selection menu for a state
   */
  static getHotelCitySelectionMenu(stateName, cities) {
    const keyboard = [];
    
    // Show all cities in the state
    cities.forEach(city => {
      keyboard.push([{
        text: `🏙️ ${city.name}`,
        callback_data: `hotel_city_${stateName}_${city.name}`
      }]);
    });
    
    // Navigation buttons
    keyboard.push([
      { text: '🔙 Back to States', callback_data: 'hotel_browse_states' },
      { text: '🏠 Main Menu', callback_data: 'main_menu' }
    ]);
    
    return {
      message: `🏨 *Hotels in ${stateName} State*\n\n` +
               `Select a city to see available hotels:\n\n` +
               `📍 ${cities.length} cities available\n\n` +
               `━━━━━━━━━━━━━━━━━━━━`,
      keyboard: { inline_keyboard: keyboard }
    };
  }

  /**
   * Format hotel list from Google Maps
   */
  static formatHotelList(hotels, location = null, userLocation = null) {
    if (!hotels || hotels.length === 0) {
      return {
        message: '❌ No hotels found in this area.\n\n' +
                'Try:\n' +
                '• Searching in a different city\n' +
                '• Expanding your search radius\n' +
                '• Browsing by state',
        keyboard: {
          inline_keyboard: [
            [
              { text: '📍 Browse by State', callback_data: 'hotel_browse_states' },
              { text: '🔍 Search Again', callback_data: 'hotel_search' }
            ],
            [
              { text: '🏠 Main Menu', callback_data: 'main_menu' }
            ]
          ]
        }
      };
    }

    let message = '🏨 *Hotels Found*\n\n';
    
    if (location) {
      message += `📍 Location: ${location}\n`;
    }
    message += `✨ ${hotels.length} hotel${hotels.length > 1 ? 's' : ''} available\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    const keyboard = [];
    
    hotels.slice(0, 10).forEach((hotel, index) => {
      // Hotel rating
      const stars = this.getRatingStars(hotel.rating);
      const priceLevel = '💰'.repeat(hotel.priceLevel || 2);
      
      // Distance info
      let distanceText = '';
      if (hotel.distance !== undefined) {
        distanceText = hotel.distance < 1 
          ? `${Math.round(hotel.distance * 1000)}m away`
          : `${hotel.distance}km away`;
      }
      
      // Status
      const statusEmoji = hotel.isOpen ? '✅' : '🔴';
      const statusText = hotel.isOpen ? 'Open Now' : 'Closed';
      
      message += `${index + 1}. *${hotel.name}*\n`;
      message += `   ${stars} (${hotel.rating || 'N/A'}) • ${priceLevel}\n`;
      if (distanceText) {
        message += `   📍 ${distanceText} • ${statusEmoji} ${statusText}\n`;
      } else {
        message += `   ${statusEmoji} ${statusText}\n`;
      }
      message += `   ${hotel.address}\n\n`;
      
      // Add button for this hotel
      keyboard.push([{
        text: `🏨 ${hotel.name}`,
        callback_data: `hotel_view_${hotel.id}`
      }]);
    });

    if (hotels.length > 10) {
      message += `\n_...and ${hotels.length - 10} more hotels_\n\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💡 Tap a hotel to see full details`;
    
    // Navigation buttons
    keyboard.push([
      { text: '🔍 New Search', callback_data: 'hotel_search' },
      { text: '📍 Nearby Hotels', callback_data: 'hotels_near_me' }
    ]);
    keyboard.push([
      { text: '🏠 Main Menu', callback_data: 'main_menu' }
    ]);
    
    return {
      message: message,
      keyboard: { inline_keyboard: keyboard }
    };
  }

  /**
   * Format hotel details from Google Maps
   */
  static formatHotelDetails(hotel, photoUrl = null) {
    let message = `🏨 *${hotel.name}*\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Rating
    const stars = this.getRatingStars(hotel.rating);
    message += `⭐ ${stars} ${hotel.rating || 'N/A'}/5.0\n`;
    if (hotel.totalRatings) {
      message += `   Based on ${hotel.totalRatings} reviews\n`;
    }
    message += `\n`;
    
    // Price
    const HotelDiscoveryService = require('../services/HotelDiscoveryService');
    const priceRange = HotelDiscoveryService.formatPriceRange(hotel.priceLevel || 2);
    message += `💰 *Price Range:* ${priceRange}\n\n`;
    
    // Address
    message += `📍 *Address:*\n${hotel.address}\n\n`;
    
    // Contact
    if (hotel.phone) {
      message += `📞 *Phone:* ${hotel.phone}\n`;
    }
    if (hotel.website) {
      message += `🌐 *Website:* ${hotel.website}\n`;
    }
    if (hotel.phone || hotel.website) {
      message += `\n`;
    }
    
    // Opening hours
    if (hotel.openingHours) {
      const isOpen = hotel.openingHours.open_now;
      message += `🕐 *Status:* ${isOpen ? '✅ Open Now' : '🔴 Closed'}\n`;
      
      if (hotel.openingHours.weekday_text && hotel.openingHours.weekday_text.length > 0) {
        message += `\n*Hours:*\n`;
        hotel.openingHours.weekday_text.slice(0, 3).forEach(day => {
          message += `   ${day}\n`;
        });
        if (hotel.openingHours.weekday_text.length > 3) {
          message += `   _...and more_\n`;
        }
      }
      message += `\n`;
    }
    
    // Location coordinates
    if (hotel.location) {
      message += `📌 *Coordinates:*\n`;
      message += `   Lat: ${hotel.location.lat}\n`;
      message += `   Lng: ${hotel.location.lng}\n\n`;
    }
    
    // Reviews preview
    if (hotel.reviews && hotel.reviews.length > 0) {
      message += `💬 *Recent Reviews:*\n\n`;
      hotel.reviews.slice(0, 2).forEach(review => {
        const reviewStars = this.getRatingStars(review.rating);
        message += `   ${reviewStars} "${review.text?.substring(0, 100)}${review.text?.length > 100 ? '...' : ''}"\n`;
        message += `   - ${review.author_name}\n\n`;
      });
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📱 *Next Steps:*\n`;
    message += `• Call to check availability\n`;
    message += `• Visit website to book online\n`;
    message += `• View on Google Maps for directions`;
    
    // Keyboard
    const keyboard = [];
    
    // Map link
    if (hotel.location) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hotel.location.lat},${hotel.location.lng}`;
      keyboard.push([{
        text: '🗺️ View on Google Maps',
        url: mapsUrl
      }]);
    }
    
    // Phone call
    if (hotel.phone) {
      keyboard.push([{
        text: `📞 Call ${hotel.name}`,
        url: `tel:${hotel.phone.replace(/\s/g, '')}`
      }]);
    }
    
    // Website
    if (hotel.website) {
      keyboard.push([{
        text: '🌐 Visit Website',
        url: hotel.website
      }]);
    }
    
    // Navigation
    keyboard.push([
      { text: '🔍 Find Similar', callback_data: 'hotel_search' },
      { text: '📍 Nearby Hotels', callback_data: 'hotels_near_me' }
    ]);
    keyboard.push([
      { text: '🔙 Back to Results', callback_data: 'hotel_back_results' },
      { text: '🏠 Main Menu', callback_data: 'main_menu' }
    ]);
    
    return {
      message: message,
      keyboard: { inline_keyboard: keyboard },
      photoUrl: photoUrl
    };
  }

  /**
   * Get hotel categories menu
   */
  static getHotelCategoriesMenu() {
    const HotelDiscoveryService = require('../services/HotelDiscoveryService');
    const categories = HotelDiscoveryService.HOTEL_CATEGORIES;
    
    const keyboard = [];
    
    categories.forEach(category => {
      keyboard.push([{
        text: category.name,
        callback_data: `hotel_category_${category.id}`
      }]);
    });
    
    keyboard.push([
      { text: '🔙 Back to Hotels', callback_data: 'menu_hotels' },
      { text: '🏠 Main Menu', callback_data: 'main_menu' }
    ]);
    
    return {
      message: '🏨 *Browse Hotels by Category*\n\n' +
               'Select a category to find hotels:\n\n' +
               '━━━━━━━━━━━━━━━━━━━━',
      keyboard: { inline_keyboard: keyboard }
    };
  }
}

module.exports = InterfaceManager;
