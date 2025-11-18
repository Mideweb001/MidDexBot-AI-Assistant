/**
 * UX Integration Patch
 * This file contains the new menu methods to be added to server.js
 * Copy these methods and integrate them into the TelegramDocumentBot class
 */

// Replace the existing getMainMenuKeyboard and showMainMenu methods with these:

getMainMenuKeyboard() {
  return InterfaceManager.getMainMenuKeyboard();
}

async showMainMenu(chatId) {
  const user = await this.databaseService.getUserByTelegramId(chatId);
  const firstName = user ? user.first_name : 'there';
  
  const message = InterfaceManager.getMainMenuMessage(firstName);

  await this.bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: this.getMainMenuKeyboard()
  });
}

// Add these new category-specific menu handlers:

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
}

// Update the showHelpMenu method with:

async showHelpMenu(chatId) {
  const message = InterfaceManager.getHelpMenu();
  await this.bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: this.getMainMenuKeyboard()
  });
}
