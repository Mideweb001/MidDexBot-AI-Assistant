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
    message += `✨ Your AI-Powered Super Assistant\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `🛍️ Marketplace - Shop local businesses\n`;
    message += `🍽️ Food Delivery - Order delicious meals\n`;
    message += `📚 Study Hub - AI-powered learning\n`;
    message += `💼 Career Tools - Professional growth\n`;
    message += `💰 Crypto Trading - Track and trade\n`;
    message += `🎯 Quick Actions - Fast access\n`;
    message += `🏨 Hotels - Book amazing stays\n\n`;
    
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
          { text: '🍽️ Food Delivery', callback_data: 'menu_food' }
        ],
        [
          { text: '📚 Study Hub', callback_data: 'menu_study' },
          { text: '💼 Career Tools', callback_data: 'menu_career' }
        ],
        [
          { text: '💰 Crypto Trading', callback_data: 'menu_crypto' },
          { text: '🎯 Quick Actions', callback_data: 'menu_quick' }
        ],
        [
          { text: '🏨 Hotels', callback_data: 'menu_hotels' },
          { text: '💡 Help', callback_data: 'show_help' }
        ]
      ]
    };
  }

  /**
   * Generate marketplace hub menu
   */
  static getMarketplaceMenu() {
    const { marketplace } = ModernUX;
    
    let message = `${marketplace.main.title}\n`;
    message += `${marketplace.main.subtitle}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    marketplace.main.actions.forEach(action => {
      message += `${action.emoji} *${action.label}*\n`;
      message += `   ${action.command}\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📊 *Categories Available:*\n`;
    
    marketplace.categories.forEach((cat, index) => {
      if (index % 2 === 0) message += `${cat.emoji} ${cat.name}`;
      else message += ` • ${cat.emoji} ${cat.name}\n`;
    });
    
    return message;
  }

  /**
   * Generate food delivery hub menu
   */
  static getFoodDeliveryMenu() {
    const { food } = ModernUX;
    
    let message = `${food.main.title}\n`;
    message += `${food.main.subtitle}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    food.main.actions.forEach(action => {
      message += `${action.emoji} *${action.label}*\n`;
      message += `   ${action.command}\n\n`;
    });
    
    return message;
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
   * Generate hotel booking menu
   */
  static getHotelsMenu() {
    const { hotels } = ModernUX;
    
    let message = `🏨 *Hotel Booking*\n`;
    message += `Find & Book Amazing Stays\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    hotels.main.actions.forEach((action, index) => {
      message += `${action.emoji} *${action.label}* - ${action.command}\n`;
    });
    
    message += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `🌍 *Coverage*\n`;
    message += `• All 36 Nigerian States + FCT\n`;
    message += `• African Hotels\n`;
    message += `• Verified Properties\n`;
    
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
          { text: '🔎 Search', callback_data: 'search_businesses' },
          { text: '🏬 My Business', callback_data: 'my_business' }
        ],
        [
          { text: '🛒 My Orders', callback_data: 'my_orders' },
          { text: '➕ Register', callback_data: 'register_business' }
        ],
        [buttons.home]
      ];
    } else if (section === 'food') {
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
          { text: '📋 My Bookings', callback_data: 'my_bookings' }
        ],
        [
          { text: '⭐ Write Review', callback_data: 'write_review' },
          { text: '🏢 Register Hotel', callback_data: 'register_hotel' }
        ],
        [
          { text: '💼 Manage Hotels', callback_data: 'manage_hotels' }
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
    message += `/search - Find businesses\n`;
    message += `/registerbusiness - List your business\n`;
    message += `/mybusiness - Manage businesses\n`;
    message += `/myorders - Track orders\n`;
    message += `/review - Rate & review\n\n`;
    
    message += `🍽️ *Food Delivery Commands*\n`;
    message += `/food - Food hub\n`;
    message += `/restaurants - Browse options\n`;
    message += `/orderfood - Place order\n`;
    message += `/orders - Order history\n\n`;
    
    message += `📚 *Study Commands*\n`;
    message += `/research - Research assistant\n`;
    message += `/notes - Smart notes\n`;
    message += `/homework - Get help\n`;
    message += `/study - Study plan\n`;
    message += `/timer - Study timer\n`;
    message += `/studygroup - Study groups\n\n`;
    
    message += `💼 *Career Commands*\n`;
    message += `/analyze - Analyze CV\n`;
    message += `/improve - Enhance CV\n`;
    message += `/cover - Cover letter\n`;
    message += `/score - ATS score\n`;
    message += `/courses - Find courses\n\n`;
    
    message += `💰 *Crypto Commands*\n`;
    message += `/crypto - Prices & info\n`;
    message += `/cryptonews - Latest news\n`;
    message += `/cryptoalert - Price alerts\n`;
    message += `/buy - Buy crypto\n`;
    message += `/sell - Sell crypto\n\n`;
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💡 _Tip: Use the keyboard buttons for quick access!_`;
    
    return message;
  }
}

module.exports = InterfaceManager;
