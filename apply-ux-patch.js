const fs = require('fs');

// Read the server.js file
const filePath = './src/server.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace getMainMenuKeyboard method
const getMainMenuKeyboardOld = /getMainMenuKeyboard\(\) \{[\s\S]*?resize_keyboard: true,[\s\S]*?one_time_keyboard: false[\s\S]*?\};[\s\S]*?\}/;
const getMainMenuKeyboardNew = `getMainMenuKeyboard() {
    return InterfaceManager.getMainMenuKeyboard();
  }`;

content = content.replace(getMainMenuKeyboardOld, getMainMenuKeyboardNew);

// Find and replace showMainMenu method  
const showMainMenuPattern = /async showMainMenu\(chatId\) \{[\s\S]*?⚡ \*\*Quick Commands:\*\* \/search, \/register_business, \/my_orders, \/help`;[\s\S]*?await this\.bot\.sendMessage\(chatId, message, \{[\s\S]*?parse_mode: 'Markdown',[\s\S]*?reply_markup: this\.getMainMenuKeyboard\(\)[\s\S]*?\}\);[\s\S]*?\}/;

const showMainMenuNew = `async showMainMenu(chatId) {
    const user = await this.databaseService.getUserByTelegramId(chatId);
    const firstName = user ? user.first_name : 'there';
    
    const message = InterfaceManager.getMainMenuMessage(firstName);

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: this.getMainMenuKeyboard()
    });
  }

  // Category-specific menu handlers
  async showMarketplaceMenu(chatId) {
    const message = InterfaceManager.getMarketplaceMenu();
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: InterfaceManager.getSectionKeyboard('marketplace')
    });
  }

  async showFoodDeliveryMenu(chatId) {
    const message = InterfaceManager.getFoodDeliveryMenu();
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: InterfaceManager.getSectionKeyboard('food')
    });
  }

  async showStudyHubMenu(chatId) {
    const message = InterfaceManager.getStudyHubMenu();
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: InterfaceManager.getSectionKeyboard('study')
    });
  }

  async showCareerToolsMenu(chatId) {
    const message = InterfaceManager.getCareerToolsMenu();
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: InterfaceManager.getSectionKeyboard('career')
    });
  }

  async showCryptoTradingMenu(chatId) {
    const message = InterfaceManager.getCryptoTradingMenu();
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: InterfaceManager.getSectionKeyboard('crypto')
    });
  }

  async showQuickActionsMenu(chatId) {
    const message = InterfaceManager.getQuickActionsMenu();
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: InterfaceManager.getSectionKeyboard('quick')
    });
  }`;

content = content.replace(showMainMenuPattern, showMainMenuNew);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ UX integration completed!');
console.log('✅ getMainMenuKeyboard() updated');
console.log('✅ showMainMenu() updated');
console.log('✅ Added 6 category menu methods');
