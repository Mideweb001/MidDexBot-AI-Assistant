#!/usr/bin/env node

/**
 * Telegram Bot Setup Script
 * This script helps you set up your Telegram bot with the Telegram Bot API
 */

const https = require('https');
require('dotenv').config();

class TelegramBotSetup {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!this.token) {
      console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
      console.log('📝 Please add your bot token to .env file:');
      console.log('   TELEGRAM_BOT_TOKEN=your_bot_token_here');
      process.exit(1);
    }
  }

  async getBotInfo() {
    return new Promise((resolve, reject) => {
      const url = `https://api.telegram.org/bot${this.token}/getMe`;
      
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.ok) {
              resolve(response.result);
            } else {
              reject(new Error(response.description || 'Failed to get bot info'));
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  async setWebhook(webhookUrl) {
    return new Promise((resolve, reject) => {
      const url = `https://api.telegram.org/bot${this.token}/setWebhook`;
      const postData = JSON.stringify({
        url: webhookUrl,
        drop_pending_updates: true
      });
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = https.request(url, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.ok) {
              resolve(response.result);
            } else {
              reject(new Error(response.description || 'Failed to set webhook'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });
  }

  async deleteWebhook() {
    return new Promise((resolve, reject) => {
      const url = `https://api.telegram.org/bot${this.token}/deleteWebhook`;
      
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.ok) {
              resolve(response.result);
            } else {
              reject(new Error(response.description || 'Failed to delete webhook'));
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  async run() {
    try {
      console.log('🤖 Setting up Telegram Bot...\n');
      
      // Get bot info
      console.log('📡 Fetching bot information...');
      const botInfo = await this.getBotInfo();
      
      console.log('✅ Bot information:');
      console.log(`   Name: ${botInfo.first_name}`);
      console.log(`   Username: @${botInfo.username}`);
      console.log(`   ID: ${botInfo.id}`);
      console.log('');
      
      // Setup for polling (development)
      console.log('🔧 Setting up for polling mode (development)...');
      await this.deleteWebhook();
      console.log('✅ Webhook deleted - bot ready for polling mode');
      
      console.log('\n🎉 Setup complete!');
      console.log('\n📝 Next steps:');
      console.log('   1. Run: npm start');
      console.log('   2. Open Telegram and send /start to @' + botInfo.username);
      console.log('   3. Upload a document to test AI processing');
      
      console.log('\n🔗 Bot link: https://t.me/' + botInfo.username);
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      console.log('\n🔍 Troubleshooting:');
      console.log('   1. Check your TELEGRAM_BOT_TOKEN in .env file');
      console.log('   2. Verify the token is from @BotFather');
      console.log('   3. Ensure the bot token is active');
      process.exit(1);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new TelegramBotSetup();
  setup.run();
}

module.exports = TelegramBotSetup;