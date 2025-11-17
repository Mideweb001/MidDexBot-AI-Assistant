const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const DocumentProcessor = require('./services/DocumentProcessor');
const AIAnalyzer = require('./services/AIAnalyzer');
const ConversationManager = require('./services/ConversationManager');
const PDFGenerator = require('./services/PDFGenerator');
const StudyAssistant = require('./services/StudyAssistant');
const DatabaseService = require('./services/DatabaseService');
const CryptoService = require('./services/CryptoService');
const CryptoNewsService = require('./services/CryptoNewsService');
const CryptoAlertMonitor = require('./services/CryptoAlertMonitor');
const CryptoInventoryService = require('./services/CryptoInventoryService');
const StudyGroupService = require('./services/StudyGroupService');
const HomeworkAssistant = require('./services/HomeworkAssistant');
const EventManager = require('./services/EventManager');
const CourseService = require('./services/CourseService');
const FoodOrderService = require('./services/FoodOrderService');

class TelegramDocumentBot {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.port = process.env.PORT || 3000;
    this.webhookUrl = process.env.WEBHOOK_URL;
    this.isProduction = process.env.NODE_ENV === 'production';
    
    if (!this.botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN is required');
      process.exit(1);
    }

    // Initialize database service first
    this.databaseService = new DatabaseService();
    
    // Initialize services with database dependency
    this.documentProcessor = new DocumentProcessor();
    this.aiAnalyzer = new AIAnalyzer();
    this.conversationManager = new ConversationManager(this.databaseService);
    this.pdfGenerator = new PDFGenerator();
    this.studyAssistant = new StudyAssistant();
    
    // Initialize crypto services
    this.cryptoService = new CryptoService();
    this.cryptoNewsService = new CryptoNewsService();
    this.cryptoAlertMonitor = new CryptoAlertMonitor(this.bot);
    this.cryptoInventoryService = new CryptoInventoryService();
    
    // Initialize study group service
    this.studyGroupService = StudyGroupService;
    
    // Initialize homework assistant
    this.homeworkAssistant = HomeworkAssistant;
    
    // Initialize event manager
    this.eventManager = new EventManager(this.databaseService);
    
    // Initialize course service
    this.courseService = new CourseService(this.databaseService);
    
    // Database storage handles document persistence
    
    // Initialize Telegram bot with appropriate method
    if (this.isProduction && this.webhookUrl) {
      // Production: Use webhooks
      this.bot = new TelegramBot(this.botToken, { webHook: true });
    } else {
      // Development: Use polling
      this.bot = new TelegramBot(this.botToken, { polling: true });
    }
    
    // Initialize Express app
    this.app = express();
    this.app.use(express.json());
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mode: this.isProduction ? 'production' : 'development',
        webhook: this.isProduction && this.webhookUrl ? this.webhookUrl : 'disabled'
      });
    });
    
    // Webhook endpoint for production
    if (this.isProduction && this.webhookUrl) {
      this.app.post('/webhook', (req, res) => {
        this.bot.processUpdate(req.body);
        res.sendStatus(200);
      });
    }

    this.setupBotHandlers();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // File upload handling
    const upload = multer({ 
      dest: 'uploads/',
      limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
    });
    this.app.use(upload.any());
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'MidDexBot AI Assistant',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Webhook endpoint (for production)
    this.app.post('/webhook', (req, res) => {
      this.bot.processUpdate(req.body);
      res.sendStatus(200);
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'MidDexBot AI Assistant',
        version: '1.0.0',
        description: 'Professional AI-powered document processing for career advancement',
        endpoints: {
          health: '/health',
          webhook: '/webhook'
        }
      });
    });
  }

  setupBotHandlers() {
    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showMainMenu(chatId);
    });

    // Research command
    this.bot.onText(/\/research (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const query = match[1];
      
      await this.bot.sendMessage(chatId, '🔍 Researching your topic with MidDexBot...');
      const research = await this.studyAssistant.instantResearch(query, chatId);
      await this.sendResearchResults(chatId, research);
    });

    // Notes command
    this.bot.onText(/\/notes (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const content = match[1];
      
      await this.bot.sendMessage(chatId, '📝 Creating smart notes with MidDexBot...');
      const notes = await this.studyAssistant.createSmartNotes(content, 'User Content', chatId);
      await this.sendSmartNotes(chatId, notes);
    });

    // Homework command
    this.bot.onText(/\/homework (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const problem = match[1];
      
      await this.bot.sendMessage(chatId, '📚 Analyzing your homework with MidDexBot...');
      const help = await this.studyAssistant.homeworkHelper(problem, 'General', chatId);
      await this.sendHomeworkHelp(chatId, help);
    });

    // Study command
    this.bot.onText(/\/study/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showStudyPlanOptions(chatId);
    });

    // Timer command
    this.bot.onText(/\/timer (\d+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const minutes = parseInt(match[1]);
      
      if (minutes > 0 && minutes <= 300) { // Max 5 hours
        const timer = this.studyAssistant.startStudyTimer(minutes, 'Study Session', chatId);
        await this.bot.sendMessage(chatId, `⏰ ${timer.message}\n\nI'll notify you when your ${minutes}-minute study session is complete!`);
        
        // Set reminder
        setTimeout(async () => {
          await this.bot.sendMessage(chatId, `🔔 **Study Timer Complete!**\n\nYour ${minutes}-minute study session is finished. Great job! 🎉\n\nReady for a break or another session?`);
        }, minutes * 60 * 1000);
      } else {
        await this.bot.sendMessage(chatId, '⚠️ Please set a timer between 1-300 minutes.\nExample: /timer 25');
      }
    });

    // Debug command for troubleshooting
    this.bot.onText(/\/debug/, async (msg) => {
      const chatId = msg.chat.id;
      
      try {
        // Check database connection
        const user = await this.databaseService.getUserByTelegramId(chatId);
        const userStats = user ? await this.databaseService.getUserStats(user.id) : null;
        
        // Check OpenAI status
        let aiStatus = 'Available';
        try {
          // Simple test call to OpenAI
          const testAnalysis = await this.aiAnalyzer.analyzeText('Test');
          aiStatus = 'Working';
        } catch (error) {
          aiStatus = error.message.includes('quota') ? 'Quota Exceeded' : 'Error';
        }
        
        const debugInfo = `
🔧 **MidDexBot Debug Information**

📊 **System Status:**
• Database: ✅ Connected
• AI Service: ${aiStatus === 'Working' ? '✅' : '⚠️'} ${aiStatus}
• Bot Version: 2.1.0 (Crypto Edition)

👤 **User Info:**
• User ID: ${user ? user.id : 'Not found'}
• Documents Processed: ${userStats ? userStats.documentsProcessed : 0}
• Images Processed: ${userStats ? userStats.imagesProcessed : 0}
• Study Sessions: ${userStats ? userStats.studySessionsTotal : 0}
• Total Study Time: ${userStats ? userStats.totalStudyTimeMinutes : 0} minutes

🔮 **Available Features:**
✅ Document Analysis (PDF/Text)
✅ Image OCR & PDF Creation
✅ CV/Resume Tools
✅ Study Assistant
✅ Database Storage
✅ Crypto Price Tracking
✅ Crypto News & Alerts
${aiStatus === 'Working' ? '✅' : '⚠️'} AI Analysis

🆘 **Need Help?**
• Upload an image to test image processing
• Send text for document analysis
• Use /research [topic] for instant research
• Try /timer 5 for a quick study session
• Use /crypto to explore crypto features

${aiStatus !== 'Working' ? '\n⚠️ Note: OpenAI features may be limited due to API status' : ''}
        `;
        
        await this.bot.sendMessage(chatId, debugInfo);
        
      } catch (error) {
        console.error('Debug command error:', error);
        await this.bot.sendMessage(chatId, `❌ Debug Error: ${error.message}`);
      }
    });

    // === CRYPTO COMMANDS ===
    
    // Main crypto command
    this.bot.onText(/\/crypto(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const query = match ? match[1] : null;
      
      if (query) {
        // Search for specific cryptocurrency
        await this.handleCryptoSearch(chatId, query);
      } else {
        // Show crypto main menu
        await this.showCryptoMainMenu(chatId);
      }
    });

    // Crypto news command
    this.bot.onText(/\/cryptonews(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const coinId = match ? match[1] : null;
      
      await this.handleCryptoNews(chatId, coinId);
    });

    // Crypto alert command
    this.bot.onText(/\/cryptoalert/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showCryptoAlertMenu(chatId);
    });

    // Watchlist command
    this.bot.onText(/\/watchlist/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showWatchlistMenu(chatId);
    });

    // Inventory commands
    this.bot.onText(/\/inventory/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showInventoryMenu(chatId);
    });

    this.bot.onText(/\/buy(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const coinQuery = match ? match[1] : null;
      
      if (coinQuery) {
        await this.initiateBuyTransaction(chatId, coinQuery);
      } else {
        await this.bot.sendMessage(chatId, '💰 *Buy Cryptocurrency*\n\nPlease specify which cryptocurrency you want to buy.\n\nExample: `/buy bitcoin` or `/buy BTC`', { parse_mode: 'Markdown' });
      }
    });

    this.bot.onText(/\/sell(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const coinQuery = match ? match[1] : null;
      
      if (coinQuery) {
        await this.initiateSellTransaction(chatId, coinQuery);
      } else {
        await this.bot.sendMessage(chatId, '💸 *Sell Cryptocurrency*\n\nPlease specify which cryptocurrency you want to sell.\n\nExample: `/sell bitcoin` or `/sell BTC`', { parse_mode: 'Markdown' });
      }
    });

    // === CAREER COMMANDS ===
    
    // Analyze command
    this.bot.onText(/\/analyze/, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(chatId, '📄 *Document Analysis*\n\nPlease upload a PDF, image, or text document for AI-powered analysis.\n\nSupported formats: PDF, JPG, PNG, WEBP, TXT, MD', { parse_mode: 'Markdown' });
    });

    // Improve CV/Resume command
    this.bot.onText(/\/improve/, async (msg) => {
      const chatId = msg.chat.id;
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ Please start the bot first with /start');
        return;
      }

      const lastDoc = await this.databaseService.getLastDocument(user.id);
      if (!lastDoc) {
        await this.bot.sendMessage(chatId, '📄 Please upload a CV/Resume document first, then use /improve');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '✨ Analyzing your CV/Resume for improvements...');
        const improvement = await this.aiAnalyzer.improveCVContent(lastDoc.extracted_text || lastDoc.text);
        await this.bot.sendMessage(chatId, improvement, { parse_mode: 'Markdown' });
      } catch (error) {
        await this.bot.sendMessage(chatId, '❌ Error improving CV: ' + error.message);
      }
    });

    // Cover letter generation command
    this.bot.onText(/\/cover/, async (msg) => {
      const chatId = msg.chat.id;
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ Please start the bot first with /start');
        return;
      }

      const lastDoc = await this.databaseService.getLastDocument(user.id);
      if (!lastDoc) {
        await this.bot.sendMessage(chatId, '📄 Please upload a CV/Resume document first, then use /cover');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '✍️ Generating professional cover letter...');
        const coverLetter = await this.aiAnalyzer.generateCoverLetter(lastDoc.extracted_text || lastDoc.text);
        await this.bot.sendMessage(chatId, coverLetter, { parse_mode: 'Markdown' });
      } catch (error) {
        await this.bot.sendMessage(chatId, '❌ Error generating cover letter: ' + error.message);
      }
    });

    // ATS Score command
    this.bot.onText(/\/score/, async (msg) => {
      const chatId = msg.chat.id;
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ Please start the bot first with /start');
        return;
      }

      const lastDoc = await this.databaseService.getLastDocument(user.id);
      if (!lastDoc) {
        await this.bot.sendMessage(chatId, '📄 Please upload a CV/Resume document first, then use /score');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '📊 Calculating ATS compatibility score...');
        const score = await this.aiAnalyzer.getATSScore(lastDoc.extracted_text || lastDoc.text);
        await this.bot.sendMessage(chatId, score, { parse_mode: 'Markdown' });
      } catch (error) {
        await this.bot.sendMessage(chatId, '❌ Error calculating ATS score: ' + error.message);
      }
    });

    // === HOMEWORK HELPER COMMANDS ===
    
    // Alternative homework command
    this.bot.onText(/\/askhw (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const question = match[1];
      await this.handleHomeworkQuestion(chatId, question);
    });

    // Homework helper guide
    this.bot.onText(/\/hwhelp/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showHomeworkMenu(chatId);
    });

    // My homework history
    this.bot.onText(/\/myhomework/, async (msg) => {
      const chatId = msg.chat.id;
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ Please start the bot first with /start');
        return;
      }

      try {
        const stats = await this.homeworkAssistant.getHomeworkStats(user.id);
        const recentSessions = await this.homeworkAssistant.getRecentHomework(user.id, 5);
        
        let message = `📚 *Your Homework History*\n\n`;
        message += `📊 **Statistics:**\n`;
        message += `• Total Questions: ${stats.total}\n`;
        message += `• Completed: ${stats.completed}\n`;
        message += `• Pending: ${stats.pending}\n\n`;
        
        if (recentSessions.length > 0) {
          message += `📝 **Recent Sessions:**\n`;
          recentSessions.forEach((session, index) => {
            message += `${index + 1}. ${session.subject} - ${session.question.substring(0, 50)}...\n`;
          });
        } else {
          message += `No homework sessions found. Use /homework to get started!`;
        }

        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        await this.bot.sendMessage(chatId, '❌ Error fetching homework history: ' + error.message);
      }
    });

    // === EVENT COMMANDS ===
    
    // Add event command
    this.bot.onText(/\/addevent (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const title = match[1];
      
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ Please start the bot first with /start');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, `📅 Creating event: "${title}"\n\nPlease provide the date and time (e.g., "2025-12-01 14:30"):`);
        // Store the event title for the next message
        await this.databaseService.setConversationData(user.id, { pendingEvent: title });
      } catch (error) {
        await this.bot.sendMessage(chatId, '❌ Error creating event: ' + error.message);
      }
    });

    // Events command
    this.bot.onText(/\/events/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showEventsMenu(chatId);
    });

    // Countdown command
    this.bot.onText(/\/countdown/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showEventCountdowns(chatId);
    });

    // Reminders command
    this.bot.onText(/\/reminders/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showReminderSettings(chatId);
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showHelpMenu(chatId);
    });

    // Add menu command
    this.bot.onText(/\/menu/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showMainMenu(chatId);
    });

    // === STUDY GROUP COMMANDS ===
    
    // Main study groups command
    this.bot.onText(/\/studygroup(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      await this.showStudyGroupMenu(chatId);
    });

    // Create study group command
    this.bot.onText(/\/creategroup/, async (msg) => {
      const chatId = msg.chat.id;
      await this.initiateGroupCreation(chatId);
    });

    // Join study group command
    this.bot.onText(/\/joingroup(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const joinCode = match && match[1] ? match[1].trim() : null;
      
      if (joinCode) {
        await this.joinGroupByCode(chatId, joinCode);
      } else {
        await this.showJoinGroupOptions(chatId);
      }
    });

    // Find study groups command
    this.bot.onText(/\/findgroups(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const query = match && match[1] ? match[1].trim() : null;
      
      if (query) {
        await this.searchStudyGroups(chatId, query);
      } else {
        await this.showFindGroupsMenu(chatId);
      }
    });

    // My study groups command
    this.bot.onText(/\/mygroups/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showMyStudyGroups(chatId);
    });

    // === HOMEWORK HELPER COMMANDS ===
    
    // Main homework command
    this.bot.onText(/\/homework(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const question = match && match[1] ? match[1].trim() : null;
      
      if (question) {
        await this.submitHomeworkQuestion(chatId, question);
      } else {
        await this.showHomeworkMenu(chatId);
      }
    });

    // Ask homework question command
    this.bot.onText(/\/askhw(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const question = match && match[1] ? match[1].trim() : null;
      
      if (question) {
        await this.submitHomeworkQuestion(chatId, question);
      } else {
        await this.initiateHomeworkSubmission(chatId);
      }
    });

    // Homework help command
    this.bot.onText(/\/hwhelp/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showHomeworkHelp(chatId);
    });

    // My homework history command
    this.bot.onText(/\/myhomework/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showHomeworkHistory(chatId);
    });

    // === EVENT/DEADLINE MANAGEMENT COMMANDS ===
    
    // Add event command
    this.bot.onText(/\/addevent(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const title = match && match[1] ? match[1].trim() : null;
      
      if (title) {
        await this.initiateEventCreation(chatId, title);
      } else {
        await this.showAddEventForm(chatId);
      }
    });

    // Events list command
    this.bot.onText(/\/events/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showEventsMenu(chatId);
    });

    // Countdown command
    this.bot.onText(/\/countdown/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showEventCountdowns(chatId);
    });

    // Reminders command
    this.bot.onText(/\/reminders/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showReminderSettings(chatId);
    });

    // === SKILL DEVELOPMENT/COURSE COMMANDS ===
    
    // Courses command
    this.bot.onText(/\/courses(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const query = match && match[1] ? match[1].trim() : null;
      
      if (query) {
        await this.searchCourses(chatId, query);
      } else {
        await this.showCoursesMenu(chatId);
      }
    });

    // Webinars command
    this.bot.onText(/\/webinars(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const query = match && match[1] ? match[1].trim() : null;
      
      if (query) {
        await this.searchWebinars(chatId, query);
      } else {
        await this.showWebinarsMenu(chatId);
      }
    });

    // Skills command
    this.bot.onText(/\/skills(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const topic = match && match[1] ? match[1].trim() : null;
      
      if (topic) {
        await this.searchSkillsByTopic(chatId, topic);
      } else {
        await this.showSkillsMenu(chatId);
      }
    });

    // My courses command
    this.bot.onText(/\/mycourses/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showMyCoursesMenu(chatId);
    });

    // Restaurant registration command
    this.bot.onText(/\/register_restaurant/, async (msg) => {
      const chatId = msg.chat.id;
      await this.startRestaurantRegistration(chatId);
    });

    // Food ordering command
    this.bot.onText(/\/order_food/, async (msg) => {
      const chatId = msg.chat.id;
      await this.startFoodOrdering(chatId);
    });

    // Restaurant management command
    this.bot.onText(/\/manage_restaurant/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showRestaurantManagement(chatId);
    });

    // My orders command
    this.bot.onText(/\/my_orders/, async (msg) => {
      const chatId = msg.chat.id;
      await this.showMyOrders(chatId);
    });

    // Document handler
    this.bot.on('document', async (msg) => {
      await this.handleDocument(msg);
    });

    // Photo handler
    this.bot.on('photo', async (msg) => {
      await this.handlePhoto(msg);
    });

    // Location handler
    this.bot.on('location', async (msg) => {
      await this.handleLocation(msg);
    });

    // Text message handler
    this.bot.on('message', async (msg) => {
      if (!msg.document && !msg.photo && !msg.location && msg.text && !msg.text.startsWith('/')) {
        await this.handleTextMessage(msg);
      }
    });

    // Callback query handler (for inline keyboards)
    this.bot.on('callback_query', async (query) => {
      await this.handleCallbackQuery(query);
    });

    // Error handling
    this.bot.on('error', (error) => {
      console.error('🚨 Telegram Bot Error:', error);
    });

    console.log('✅ Telegram bot handlers initialized');
  }

  async handleDocument(msg) {
    const chatId = msg.chat.id;
    const document = msg.document;
    
    try {
      await this.bot.sendMessage(chatId, '� Processing document with MidDexBot...', {
        reply_to_message_id: msg.message_id
      });

      // Download and process document
      const fileId = document.file_id;
      const fileInfo = await this.bot.getFile(fileId);
      const filePath = fileInfo.file_path;
      
      // Process document
      const result = await this.documentProcessor.processFile(filePath, document.file_name);
      
      // Generate AI analysis
      const analysis = await this.aiAnalyzer.analyzeDocument(result.text, result.metadata);
      
      // Store document in database
      const user = await this.databaseService.findOrCreateUser(msg.from);
      await this.databaseService.createDocument(user.id, {
        telegram_file_id: fileId,
        filename: document.file_name,
        file_type: 'document',
        document_type: analysis.documentType,
        extracted_text: result.text,
        ai_analysis: analysis,
        ats_score: analysis.atsScore,
        processing_status: 'completed',
        metadata: result.metadata,
        word_count: analysis.wordCount
      });
      
      // Send results
      await this.sendAnalysisResults(chatId, analysis, msg.message_id);
      
    } catch (error) {
      console.error('❌ Document processing error:', error);
      await this.bot.sendMessage(chatId, '❌ Sorry, I couldn\'t process that document. Please try again.', {
        reply_to_message_id: msg.message_id
      });
    }
  }

  async handlePhoto(msg) {
    const chatId = msg.chat.id;
    
    try {
      await this.bot.sendMessage(chatId, '� Processing image with MidDexBot...', {
        reply_to_message_id: msg.message_id
      });

      // Get the largest photo version
      const photo = msg.photo[msg.photo.length - 1];
      const fileId = photo.file_id;
      const fileInfo = await this.bot.getFile(fileId);
      
      // Store image path for PDF creation
      this.conversationManager.setUserData(chatId, 'lastImagePath', fileInfo.file_path);
      await this.conversationManager.setUserData(chatId, 'lastImageFileId', fileId);
      
      // Process image with OCR using dedicated Telegram method
      const result = await this.documentProcessor.processTelegramImage(fileInfo.file_path);
      
      if (result.text.trim()) {
        // Generate AI analysis for extracted text with fallback
        let analysis;
        try {
          analysis = await this.aiAnalyzer.analyzeText(result.text);
        } catch (error) {
          console.error('❌ AI analysis failed, using fallback:', error.message);
          // Fallback analysis
          analysis = {
            summary: 'Text extracted from image: ' + result.text.substring(0, 200) + (result.text.length > 200 ? '...' : ''),
            keyPoints: ['Text successfully extracted from image', 'AI analysis unavailable - using OCR results'],
            documentType: 'Image with Text',
            wordCount: result.text.split(' ').length,
            confidence: result.confidence || 0
          };
        }
        
        // Store processed image in database
        const user = await this.databaseService.findOrCreateUser(msg.from);
        await this.databaseService.createProcessedImage(user.id, {
          telegram_file_id: fileId,
          telegram_file_path: fileInfo.file_path,
          image_type: 'photo',
          ocr_text: result.text,
          ai_analysis: analysis,
          processing_status: 'completed',
          metadata: {
            confidence: result.confidence || 0,
            originalMessage: msg.message_id,
            aiAnalysisStatus: analysis.keyPoints.includes('AI analysis unavailable') ? 'fallback' : 'success'
          }
        });
        
        await this.sendImageAnalysisResults(chatId, analysis, result, msg.message_id);
      } else {
        // Store image even without text for PDF creation
        const user = await this.databaseService.findOrCreateUser(msg.from);
        await this.databaseService.createProcessedImage(user.id, {
          telegram_file_id: fileId,
          telegram_file_path: fileInfo.file_path,
          image_type: 'photo',
          ocr_text: '',
          ai_analysis: {
            summary: 'No text detected in image',
            keyPoints: ['Image processed successfully', 'No readable text found'],
            documentType: 'Image without Text',
            wordCount: 0,
            confidence: 0
          },
          processing_status: 'completed',
          metadata: {
            confidence: 0,
            originalMessage: msg.message_id,
            hasText: false
          }
        });

        await this.bot.sendMessage(chatId, '📷 No text found in the image, but I can still create a PDF for you!', {
          reply_to_message_id: msg.message_id
        });
        
        // Even without text, offer to create PDF from image
        const keyboard = {
          inline_keyboard: [
            [
              { text: '💎 Create PDF from Image', callback_data: 'image_to_pdf' },
              { text: '🔍 Try Different Image', callback_data: 'analyze_more' }
            ]
          ]
        };
        
        await this.bot.sendMessage(chatId, '🔮 **Image Processing Options**\n\nEven without text, I can create a professional PDF from your image!', {
          reply_markup: keyboard
        });
      }
      
    } catch (error) {
      console.error('❌ Image processing error:', error);
      await this.bot.sendMessage(chatId, '❌ Sorry, I couldn\'t process that image. Please try again.', {
        reply_to_message_id: msg.message_id
      });
    }
  }

  async handleTextMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();
    
    // Handle keyboard button presses
    if (text.includes('cv tools')) {
      await this.showCVToolsMenu(chatId);
      return;
    }
    
    if (text.includes('study assistant')) {
      await this.showStudyAssistantMenu(chatId);
      return;
    }
    
    if (text.includes('crypto dashboard')) {
      await this.showCryptoMainMenu(chatId);
      return;
    }
    
    if (text.includes('research')) {
      await this.bot.sendMessage(chatId, '� What would you like me to research?\n\nExample: /research "artificial intelligence in education"');
      return;
    }
    
    if (text.includes('smart notes')) {
      await this.bot.sendMessage(chatId, '📝 Send me content to convert into smart notes!\n\nExample: /notes "Your content here"');
      return;
    }
    
    if (text.includes('homework help')) {
        await this.showHomeworkMenu(chatId);
      return;
    }
    
    if (text.includes('events & deadlines') || text.includes('events and deadlines')) {
      await this.showEventsMenu(chatId);
      return;
    }
    
    if (text.includes('skills & courses') || text.includes('skills and courses')) {
      await this.showSkillsCoursesMenu(chatId);
      return;
    }
    
    if (text.includes('food ordering')) {
      await this.startFoodOrdering(chatId);
      return;
    }
    
    if (text.includes('restaurant hub')) {
      await this.showRestaurantHub(chatId);
      return;
    }
    
    if (text.includes('main menu') || text.toLowerCase() === 'menu') {
      await this.showMainMenu(chatId);
      return;
    }
    
    if (text.includes('crypto dashboard') || text.includes('crypto')) {
      await this.showCryptoMenu(chatId);
      return;
    }
    
    if (text.includes('study groups')) {
      await this.showStudyGroupMenu(chatId);
      return;
    }
    
    if (text.includes('study timer')) {
      await this.bot.sendMessage(chatId, '⏰ How long would you like to study?\n\nExample: /timer 25 (for 25 minutes)');
      return;
    }
    
    if (text.includes('analyze document')) {
      await this.bot.sendMessage(chatId, '� Please upload a document to analyze.');
      return;
    }
    
    if (text.includes('help') || text.includes('commands')) {
      await this.showHelpMenu(chatId);
      return;
    }

    // Check if this is a reply to a force_reply message (like adding to watchlist)
    if (msg.reply_to_message && msg.reply_to_message.text && 
        msg.reply_to_message.text.includes('cryptocurrency you want to add to your watchlist')) {
      await this.addCoinToWatchlist(chatId, msg.text);
      return;
    }

    // Check if user is in study plan creation mode
    const user = await this.databaseService.getUserByTelegramId(chatId);
    const userSessionData = user ? await this.databaseService.getConversationData(user.id) : null;
    
    // Check if user is awaiting homework question input
    const awaitingHomework = await this.conversationManager.getUserData(chatId, 'awaiting_homework_question');
    if (awaitingHomework) {
      await this.conversationManager.setUserData(chatId, 'awaiting_homework_question', false);
      await this.submitHomeworkQuestion(chatId, msg.text);
      return;
    }
    
    // Check if user is creating an event
    const creatingEvent = await this.conversationManager.getUserData(chatId, 'creating_event');
    if (creatingEvent) {
      await this.processEventCreation(chatId, msg.text, creatingEvent.step);
      return;
    }
    
    if (userSessionData && userSessionData.mode === 'study_plan_creation') {
      await this.handleStudyPlanCreation(chatId, msg.text, userSessionData);
      return;
    }

    // Check if user is in buy transaction mode
    if (userSessionData && userSessionData.mode === 'buy_transaction') {
      await this.processBuyTransaction(chatId, msg.text, userSessionData);
      return;
    }

    // Check if user is in sell transaction mode
    if (userSessionData && userSessionData.mode === 'sell_transaction') {
      await this.processSellTransaction(chatId, msg.text, userSessionData);
      return;
    }

    // Check for research requests (questions starting with keywords)
    if (this.isResearchQuery(msg.text)) {
      await this.bot.sendMessage(chatId, '🔍 Researching your question with MidDexBot...');
      const research = await this.studyAssistant.instantResearch(msg.text, chatId);
      await this.sendResearchResults(chatId, research);
      return;
    }

    // Check if this is substantial text that could be a CV or document content
    if (msg.text.length > 100) {
      await this.processTextAsDocument(chatId, msg.text, msg.message_id);
      return;
    }

    // Handle general conversation
    await this.conversationManager.handleMessage(chatId, msg.text, this.bot);
  }

  async processTextAsDocument(chatId, textContent, replyToId) {
    try {
      await this.bot.sendMessage(chatId, '🔮 Processing your text with MidDexBot...', {
        reply_to_message_id: replyToId
      });

      // Analyze the text content
      const analysis = await this.aiAnalyzer.analyzeText(textContent);
      
      // Store text document in database
      const user = await this.databaseService.findOrCreateUser({ id: chatId });
      await this.databaseService.createDocument(user.id, {
        file_type: 'text',
        document_type: analysis.documentType,
        extracted_text: textContent,
        ai_analysis: analysis,
        ats_score: analysis.atsScore,
        processing_status: 'completed',
        word_count: analysis.wordCount || textContent.split(' ').length
      });

      // Send analysis results with text-specific options
      await this.sendTextAnalysisResults(chatId, analysis, textContent, replyToId);

    } catch (error) {
      console.error('🔻 Text processing error:', error);
      await this.bot.sendMessage(chatId, '🔻 Sorry, I couldn\'t process that text. Please try again.', {
        reply_to_message_id: replyToId
      });
    }
  }

  async sendTextAnalysisResults(chatId, analysis, originalText, replyToId) {
    const isCV = analysis.documentType === 'Resume/CV' || this.detectCVContent(originalText);
    
    let message = '🔮 **Text Analysis Complete**\n\n';
    message += '💎 **Summary:**\n';
    message += analysis.summary + '\n\n';
    message += '🌟 **Key Insights:**\n';
    message += analysis.keyPoints.map(point => '✨ ' + point).join('\n') + '\n\n';
    message += '📊 **Content Type:** ' + (isCV ? 'CV/Resume Text' : analysis.documentType) + '\n';
    message += '📝 **Word Count:** ' + analysis.wordCount + ' words\n';
    message += '⏰ **Processed:** ' + new Date().toLocaleString();

    if (isCV && analysis.atsScore) {
      message += '\n🎯 **ATS Score:** ' + analysis.atsScore + '/100';
    }

    const keyboard = {
      inline_keyboard: isCV ? [
        [
          { text: '💎 Improve Content', callback_data: 'improve_text_cv' },
          { text: '🌟 Generate Cover Letter', callback_data: 'generate_cover_letter' }
        ],
        [
          { text: '⭐ Create Professional PDF', callback_data: 'text_to_pdf' },
          { text: '🔮 ATS Analysis', callback_data: 'ats_analysis' }
        ]
      ] : [
        [
          { text: '💎 Create Professional PDF', callback_data: 'text_to_pdf' },
          { text: '🌟 Improve Content', callback_data: 'improve_text_content' }
        ],
        [
          { text: '✨ Extract Key Info', callback_data: 'extract_key_info' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, {
      reply_markup: keyboard,
      reply_to_message_id: replyToId
    });
  }

  detectCVContent(text) {
    const cvKeywords = [
      'experience', 'education', 'skills', 'work history', 'employment',
      'resume', 'cv', 'curriculum vitae', 'qualifications', 'achievements',
      'career', 'professional', 'expertise', 'background'
    ];
    
    const textLower = text.toLowerCase();
    const keywordCount = cvKeywords.filter(keyword => textLower.includes(keyword)).length;
    
    return keywordCount >= 3; // If 3+ CV keywords found, likely a CV
  }

  async handleCallbackQuery(query) {
    const chatId = query.message.chat.id;
    const data = query.data;
    
    // Answer the callback query
    await this.bot.answerCallbackQuery(query.id);
    
    // Get last processed document for this chat from database
    const user = await this.databaseService.getUserByTelegramId(chatId);
    const lastDoc = user ? await this.databaseService.getLastUserDocument(user.id) : null;
    
    // Handle different callback actions
    switch (data) {
      case 'analyze_more':
        await this.bot.sendMessage(chatId, '� Send me another document to analyze!');
        break;
        
      case 'get_summary':
        if (lastDoc) {
          await this.bot.sendMessage(chatId, '� Generating detailed summary...');
          const detailedSummary = await this.generateDetailedSummary(lastDoc.extracted_text, lastDoc.ai_analysis);
          await this.bot.sendMessage(chatId, detailedSummary);
        } else {
          await this.bot.sendMessage(chatId, '🔻 No recent document found. Please upload a document first.');
        }
        break;
        
      case 'extract_key_info':
        if (lastDoc) {
          await this.bot.sendMessage(chatId, '✨ Extracting key information...');
          const keyInfo = await this.extractKeyInformation(lastDoc.extracted_text, lastDoc.ai_analysis);
          await this.bot.sendMessage(chatId, keyInfo);
        } else {
          await this.bot.sendMessage(chatId, '🔻 No recent document found. Please upload a document first.');
        }
        break;

      case 'improve_cv':
        if (lastDoc) {
          await this.bot.sendMessage(chatId, '💎 Improving your CV...');
          const improvement = await this.aiAnalyzer.improveCVContent(lastDoc.extracted_text);
          await this.sendCVImprovement(chatId, improvement);
        } else {
          await this.bot.sendMessage(chatId, '🔻 No CV found. Please upload your CV first.');
        }
        break;

      case 'generate_cover_letter':
        if (lastDoc) {
          await this.bot.sendMessage(chatId, '🌟 Generating your cover letter...');
          const coverLetter = await this.aiAnalyzer.generateCoverLetter(lastDoc.extracted_text);
          await this.sendCoverLetter(chatId, coverLetter);
        } else {
          await this.bot.sendMessage(chatId, '🔻 No CV found. Please upload your CV first.');
        }
        break;

      case 'ats_analysis':
        if (lastDoc) {
          await this.bot.sendMessage(chatId, '⭐ Analyzing ATS compatibility...');
          const atsAnalysis = await this.generateATSAnalysis(lastDoc.extracted_text, lastDoc.ai_analysis);
          await this.bot.sendMessage(chatId, atsAnalysis);
        } else {
          await this.bot.sendMessage(chatId, '🔻 No CV found. Please upload your CV first.');
        }
        break;

      case 'download_pdf':
        if (lastDoc) {
          await this.bot.sendMessage(chatId, '💎 Generating your PDF...');
          await this.generateAndSendPDF(chatId, lastDoc);
        } else {
          await this.bot.sendMessage(chatId, '🔻 No document found. Please upload a document first.');
        }
        break;

      case 'text_to_pdf':
        if (lastDoc) {
          await this.bot.sendMessage(chatId, '💎 Converting your text to professional PDF...');
          await this.generateTextToPDF(chatId, lastDoc);
        } else {
          await this.bot.sendMessage(chatId, '🔻 No text found. Please send some text first.');
        }
        break;

      case 'image_to_pdf':
        const imageData = await this.conversationManager.getUserData(chatId, 'lastProcessedImage');
        const imageFileId = await this.conversationManager.getUserData(chatId, 'lastImageFileId');
        
        if (imageData && imageFileId) {
          await this.bot.sendMessage(chatId, '💎 Creating PDF from your image...');
          await this.generateImageToPDF(chatId, imageFileId, imageData);
        } else {
          await this.bot.sendMessage(chatId, '🔻 No recent image found. Please send an image first.');
        }
        break;

      case 'improve_text_cv':
        if (lastDoc) {
          await this.bot.sendMessage(chatId, '💎 Improving your CV content...');
          const improvement = await this.aiAnalyzer.improveCVContent(lastDoc.text);
          await this.sendImprovedTextContent(chatId, improvement, 'CV');
        } else {
          await this.bot.sendMessage(chatId, '🔻 No CV text found. Please send your CV text first.');
        }
        break;

      case 'improve_text_content':
        if (lastDoc) {
          await this.bot.sendMessage(chatId, '🌟 Improving your content...');
          await this.improveGeneralTextContent(chatId, lastDoc);
        } else {
          await this.bot.sendMessage(chatId, '🔻 No text found. Please send some text first.');
        }
        break;

      // Study Assistant callbacks
      case 'start_research':
        await this.bot.sendMessage(chatId, '🔍 **Research Assistant**\n\nWhat topic would you like me to research?\n\nExample: "Climate change effects" or "Ancient Rome history"');
        break;

      case 'start_notes':
        await this.bot.sendMessage(chatId, '📝 **Smart Notes Creator**\n\nSend me content to convert into organized study notes!\n\nYou can paste text, send a topic, or upload a document.');
        break;

      case 'start_homework':
        await this.showHomeworkMenu(chatId);
        break;

      case 'start_study_plan':
        await this.showStudyPlanOptions(chatId);
        break;

      case 'start_timer':
        await this.bot.sendMessage(chatId, '⏰ **Study Timer**\n\nHow many minutes would you like to study?\n\nRecommended sessions:\n• 25 minutes (Pomodoro)\n• 45 minutes (Deep focus)\n• 90 minutes (Learning session)\n\nExample: /timer 25');
        break;

      case 'research_to_notes':
        if (lastDoc && lastDoc.analysis) {
          await this.bot.sendMessage(chatId, '📝 Converting research to smart notes...');
          const notes = await this.studyAssistant.createSmartNotes(lastDoc.analysis.summary, lastDoc.query || 'Research Topic', chatId);
          await this.sendSmartNotes(chatId, notes);
        }
        break;

      case 'research_to_pdf':
        if (lastDoc) {
          await this.bot.sendMessage(chatId, '💾 Creating PDF from research...');
          await this.generateResearchPDF(chatId, lastDoc);
        }
        break;

      case 'notes_to_pdf':
        if (lastDoc) {
          await this.bot.sendMessage(chatId, '💾 Creating PDF from notes...');
          await this.generateNotesPDF(chatId, lastDoc);
        }
        break;

      case 'main_menu':
        await this.sendWelcomeMessage(chatId);
        break;

      case 'timeframe_intensive':
      case 'timeframe_regular':
      case 'timeframe_light':
        const timeframe = data.split('_')[1];
        const user = await this.databaseService.getUserByTelegramId(chatId);
        const sessionData = user ? await this.databaseService.getConversationData(user.id) : null;
        if (sessionData && sessionData.subjects) {
          const studyPlan = this.studyAssistant.createStudyPlan(sessionData.subjects, timeframe, ['academic success'], chatId);
          await this.sendStudyPlan(chatId, studyPlan);
          await this.databaseService.clearConversation(user.id); // Clear session
        }
        break;

      // === CRYPTO CALLBACK HANDLERS ===
      case 'crypto_main':
        await this.showCryptoMainMenu(chatId);
        break;

      case 'crypto_top':
        try {
          await this.bot.sendMessage(chatId, '📈 Fetching top cryptocurrencies...');
          const topCoins = await this.cryptoService.getTopCoins(10);
          let message = '📈 *Top 10 Cryptocurrencies*\n\n';
          topCoins.forEach((coin, index) => {
            const price = this.cryptoService.formatPrice(coin.current_price);
            const change = this.cryptoService.formatPercentage(coin.price_change_percentage_24h);
            message += `${index + 1}. *${coin.symbol.toUpperCase()}* - ${price} ${change}\n`;
          });
          await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } catch (error) {
          await this.bot.sendMessage(chatId, '❌ Error fetching top cryptocurrencies.');
        }
        break;

      case 'crypto_trending':
        try {
          await this.bot.sendMessage(chatId, '🔥 Fetching trending cryptocurrencies...');
          const trending = await this.cryptoService.getTrendingCoins();
          let message = '🔥 *Trending Cryptocurrencies*\n\n';
          trending.forEach((coin, index) => {
            message += `${index + 1}. *${coin.symbol.toUpperCase()}* - ${coin.name}\n`;
          });
          await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } catch (error) {
          await this.bot.sendMessage(chatId, '❌ Error fetching trending cryptocurrencies.');
        }
        break;

      case 'crypto_search':
        await this.bot.sendMessage(chatId, '🔍 Please send me the name or symbol of the cryptocurrency you want to search for.\n\nExample: bitcoin, BTC, ethereum, etc.');
        break;

      case 'crypto_news_all':
        await this.handleCryptoNews(chatId);
        break;

      case 'watchlist_view':
        await this.showWatchlistMenu(chatId);
        break;

      case 'alerts_view':
        await this.showCryptoAlertMenu(chatId);
        break;

      default:
        // Handle dynamic crypto callbacks
        if (data.startsWith('crypto_details_')) {
          const coinId = data.replace('crypto_details_', '');
          await this.showCoinDetails(chatId, coinId);
        } else if (data.startsWith('crypto_news_')) {
          const coinId = data.replace('crypto_news_', '');
          await this.handleCryptoNews(chatId, coinId);
        } else if (data.startsWith('watchlist_add_')) {
          const coinId = data.replace('watchlist_add_', '');
          await this.addCoinToWatchlist(chatId, coinId);
        } else if (data === 'watchlist_add') {
          await this.bot.sendMessage(chatId, 'Send me the name or symbol of the cryptocurrency you want to add to your watchlist:', {
            reply_markup: {
              force_reply: true
            }
          });
        } else if (data === 'watchlist_refresh') {
          await this.showWatchlistMenu(chatId);
        } else if (data.startsWith('alert_create_')) {
          const coinId = data.replace('alert_create_', '');
          await this.bot.sendMessage(chatId, `Setting up alert for ${coinId}... (Feature coming soon!)`);
        } else if (data === 'inventory_view' || data === 'inventory_refresh') {
          await this.showInventoryMenu(chatId);
        } else if (data === 'inventory_details') {
          await this.showInventoryDetails(chatId);
        } else if (data === 'inventory_analytics') {
          await this.showInventoryAnalytics(chatId);
        } else if (data === 'inventory_buy') {
          await this.bot.sendMessage(chatId, '💰 *Buy Cryptocurrency*\n\nSend me the name or symbol of the cryptocurrency you want to buy.\n\nExample: bitcoin, BTC, ethereum, etc.', { 
            parse_mode: 'Markdown',
            reply_markup: { force_reply: true }
          });
        } else if (data === 'inventory_sell') {
          await this.bot.sendMessage(chatId, '💸 *Sell Cryptocurrency*\n\nSend me the name or symbol of the cryptocurrency you want to sell.\n\nExample: bitcoin, BTC, ethereum, etc.', { 
            parse_mode: 'Markdown',
            reply_markup: { force_reply: true }
          });
        } else if (data === 'inventory_history') {
          await this.showTransactionHistory(chatId);
        }
        // Handle dynamic study group callbacks
        else if (data.startsWith('sg_join_')) {
          const groupId = parseInt(data.replace('sg_join_', ''));
          await this.joinStudyGroup(chatId, groupId);
        } else if (data.startsWith('sg_details_')) {
          const groupId = parseInt(data.replace('sg_details_', ''));
          await this.showStudyGroupDetails(chatId, groupId);
        } else if (data.startsWith('sg_leave_')) {
          const groupId = parseInt(data.replace('sg_leave_', ''));
          await this.leaveStudyGroup(chatId, groupId);
        } else if (data.startsWith('sg_members_')) {
          const groupId = parseInt(data.replace('sg_members_', ''));
          await this.showGroupMembers(chatId, groupId);
        } else if (data.startsWith('sg_search_')) {
          const subject = data.replace('sg_search_', '');
          await this.searchStudyGroupsBySubject(chatId, subject);
        }
        // Handle dynamic homework callbacks
        else if (data.startsWith('hw_view_')) {
          const homeworkId = parseInt(data.replace('hw_view_', ''));
          await this.showHomeworkDetails(chatId, homeworkId);
        } else if (data.startsWith('hw_feedback_')) {
          const homeworkId = parseInt(data.replace('hw_feedback_', ''));
          await this.showHomeworkFeedback(chatId, homeworkId);
        } else if (data.startsWith('hw_share_')) {
          const homeworkId = parseInt(data.replace('hw_share_', ''));
          await this.shareHomework(chatId, homeworkId);
        } else if (data.startsWith('hw_subject_')) {
          const subject = data.replace('hw_subject_', '');
          await this.showHomeworkBySubject(chatId, subject);
        }
        // Handle Skills & Courses callbacks
        else if (data === 'browse_courses') {
          await this.showCourseCategoryMenu(chatId);
        } else if (data === 'course_recommendations') {
          await this.showCourseRecommendations(chatId);
        } else if (data === 'my_courses') {
          await this.showMyCoursesDashboard(chatId);
        } else if (data === 'trending_courses') {
          await this.showTrendingCourses(chatId);
        } else if (data === 'browse_webinars') {
          await this.showWebinarMenu(chatId);
        } else if (data === 'skills_assessment') {
          await this.startSkillsAssessment(chatId);
        } else if (data === 'learning_progress') {
          await this.showLearningProgressReport(chatId);
        } else if (data === 'learning_reminders') {
          await this.manageLearningReminders(chatId);
        } else if (data.startsWith('course_details_')) {
          const courseId = parseInt(data.replace('course_details_', ''));
          await this.showCourseDetails(chatId, courseId);
        } else if (data.startsWith('course_enroll_')) {
          const courseId = parseInt(data.replace('course_enroll_', ''));
          await this.enrollInCourse(chatId, courseId);
        } else if (data.startsWith('course_continue_')) {
          const courseId = parseInt(data.replace('course_continue_', ''));
          await this.continueCourse(chatId, courseId);
        } else if (data === 'main_menu') {
          await this.showMainMenu(chatId);
        }
        
        // Food ordering dynamic callbacks
        if (data.startsWith('restaurant_menu_')) {
          const restaurantId = parseInt(data.replace('restaurant_menu_', ''));
          await this.showRestaurantMenu(chatId, restaurantId);
        } else if (data.startsWith('toggle_restaurant_')) {
          const restaurantId = parseInt(data.replace('toggle_restaurant_', ''));
          await this.toggleRestaurantStatus(chatId, restaurantId);
        } else if (data.startsWith('manage_menu_')) {
          const restaurantId = parseInt(data.replace('manage_menu_', ''));
          await this.showMenuManagement(chatId, restaurantId);
        } else if (data.startsWith('restaurant_orders_')) {
          const restaurantId = parseInt(data.replace('restaurant_orders_', ''));
          await this.showRestaurantOrders(chatId, restaurantId);
        } else if (data.startsWith('restaurant_analytics_')) {
          const restaurantId = parseInt(data.replace('restaurant_analytics_', ''));
          await this.showRestaurantAnalytics(chatId, restaurantId);
        } else if (data.startsWith('restaurant_settings_')) {
          const restaurantId = parseInt(data.replace('restaurant_settings_', ''));
          await this.showRestaurantSettings(chatId, restaurantId);
        } else if (data.startsWith('menu_category_')) {
          const parts = data.replace('menu_category_', '').split('_');
          const restaurantId = parseInt(parts[0]);
          const category = parts.slice(1).join('_');
          await this.showMenuCategory(chatId, restaurantId, category);
        } else if (data.startsWith('view_cart_')) {
          const restaurantId = parseInt(data.replace('view_cart_', ''));
          await this.showCart(chatId, restaurantId);
        }
        break;

      // === STUDY GROUP CALLBACK HANDLERS ===
      case 'studygroup_main':
        await this.showStudyGroupMenu(chatId);
        break;

      case 'studygroup_create':
        await this.initiateGroupCreation(chatId);
        break;

      case 'studygroup_join':
        await this.showJoinGroupOptions(chatId);
        break;

      case 'studygroup_find':
        await this.showFindGroupsMenu(chatId);
        break;

      case 'studygroup_my':
        await this.showMyStudyGroups(chatId);
        break;

      case 'studygroup_suggestions':
        await this.showStudyGroupSuggestions(chatId);
        break;

      // === HOMEWORK HELPER CALLBACK HANDLERS ===
      case 'homework_main':
        await this.showHomeworkMenu(chatId);
        break;

      case 'homework_ask':
        await this.initiateHomeworkSubmission(chatId);
        break;

      case 'homework_history':
        await this.showHomeworkHistory(chatId);
        break;

      case 'homework_stats':
        await this.showHomeworkStats(chatId);
        break;

      case 'homework_help':
        await this.showHomeworkHelp(chatId);
        break;

      // === EVENT/DEADLINE CALLBACK HANDLERS ===
      case 'events_menu':
        await this.showEventsMenu(chatId);
        break;

      case 'add_event':
        await this.showAddEventForm(chatId);
        break;

      case 'list_events':
        await this.showAllEvents(chatId);
        break;

      case 'show_countdowns':
        await this.showEventCountdowns(chatId);
        break;

      case 'manage_reminders':
        await this.showReminderSettings(chatId);
        break;

      case 'event_stats':
        await this.showEventStatistics(chatId);
        break;

      case 'calendar_view':
        await this.showCalendarView(chatId);
        break;

      case 'quick_add_event':
        await this.quickAddEvent(chatId);
        break;

      case 'guided_add_event':
        await this.guidedAddEvent(chatId);
        break;

      // Event type selection handlers
      case 'event_type_exam':
      case 'event_type_assignment':
      case 'event_type_project':
      case 'event_type_presentation':
      case 'event_type_quiz':
      case 'event_type_deadline':
      case 'event_type_meeting':
      case 'event_type_other':
        await this.handleEventTypeSelection(chatId, data);
        break;

      // Priority selection handlers
      case 'priority_critical':
      case 'priority_high':
      case 'priority_medium':
      case 'priority_low':
        await this.handlePrioritySelection(chatId, data);
        break;

      // === FOOD ORDERING CALLBACK HANDLERS ===
      case 'start_restaurant_reg':
        await this.handleRestaurantRegistrationStep(chatId, 'name');
        break;

      case 'restaurant_guide':
        await this.showRestaurantRegistrationGuide(chatId);
        break;

      case 'start_food_ordering':
        await this.startFoodOrdering(chatId);
        break;

      case 'request_location':
        await this.requestUserLocation(chatId);
        break;

      case 'enter_address':
        await this.handleAddressEntry(chatId);
        break;

      case 'browse_restaurants':
        await this.showAllRestaurants(chatId);
        break;

      case 'my_orders':
        await this.showMyOrders(chatId);
        break;

      case 'refresh_orders':
        await this.showMyOrders(chatId);
        break;

      case 'refresh_restaurants':
        // Re-request location for fresh restaurant list
        await this.requestUserLocation(chatId);
        break;

    }
  }

  async generateDetailedSummary(text, analysis) {
    try {
      // Use OpenAI for more detailed summary if available
      if (this.aiAnalyzer.openai) {
        const completion = await this.aiAnalyzer.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional document analyst. Create a comprehensive, detailed summary that captures all important aspects of the document."
            },
            {
              role: "user",
              content: `Please provide a detailed summary of this document:\n\n${text.substring(0, 3000)}${text.length > 3000 ? '...' : ''}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        });

        const detailedSummary = completion.choices[0].message.content;
        
        return `📋 **Detailed Summary**\n\n${detailedSummary}\n\n📊 **Document Stats:**\n• Word Count: ${analysis.wordCount}\n• Document Type: ${analysis.documentType}\n• Analysis Type: ${analysis.analysisType}`;
      } else {
        // Enhanced fallback detailed summary
        return this.generateAdvancedSummary(text, analysis);
      }
    } catch (error) {
      console.error('❌ Error generating detailed summary:', error);
      // Use enhanced fallback on error
      return this.generateAdvancedSummary(text, analysis);
    }
  }

  generateAdvancedSummary(text, analysis) {
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    let summary = '';
    
    // Document type specific analysis
    if (analysis.documentType.includes('Report') || analysis.documentType.includes('Analysis')) {
      summary = `This document appears to be an academic report or course listing. `;
    } else if (cleanText.toLowerCase().includes('semester') || cleanText.toLowerCase().includes('course')) {
      summary = `This document contains academic course information, likely from a university curriculum or student schedule. `;
    } else {
      summary = `This document contains structured information with multiple sections and references. `;
    }
    
    // Content analysis
    const courseMatches = cleanText.match(/[A-Z]{2,3}\s*\d{3,4}|Introduction to [A-Z][a-z\s]+/gi);
    if (courseMatches && courseMatches.length > 0) {
      summary += `It lists ${courseMatches.length} academic courses or subjects, including specialized topics in various fields. `;
    }
    
    const semesterMatches = cleanText.match(/(First|Second|Third|Fourth|1st|2nd|3rd|4th)\s+(Semester|Term)/gi);
    if (semesterMatches && semesterMatches.length > 0) {
      summary += `The content is organized by academic terms, specifically mentioning ${semesterMatches[0]}. `;
    }
    
    // Structure analysis
    const wordCount = cleanText.split(/\s+/).length;
    if (wordCount < 50) {
      summary += `The document is concise with ${wordCount} words, suggesting it may be a list, form, or brief outline. `;
    } else if (wordCount < 200) {
      summary += `The document is moderately sized with ${wordCount} words, containing structured information. `;
    } else {
      summary += `The document is comprehensive with ${wordCount} words, providing detailed information across multiple sections. `;
    }
    
    // Content themes
    const themes = [];
    if (cleanText.toLowerCase().includes('political') || cleanText.toLowerCase().includes('government')) {
      themes.push('Political Science');
    }
    if (cleanText.toLowerCase().includes('engineering') || cleanText.includes('EE')) {
      themes.push('Engineering');
    }
    if (cleanText.toLowerCase().includes('international') || cleanText.toLowerCase().includes('relations')) {
      themes.push('International Relations');
    }
    if (cleanText.toLowerCase().includes('administration')) {
      themes.push('Administration');
    }
    if (cleanText.toLowerCase().includes('computer') || cleanText.toLowerCase().includes('logic')) {
      themes.push('Computer Science/Logic');
    }
    
    if (themes.length > 0) {
      summary += `The main academic themes include: ${themes.join(', ')}. `;
    }
    
    // Key content highlights
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (firstSentence.length > 10) {
        summary += `The opening content references "${firstSentence}". `;
      }
    }
    
    // Document purpose assessment
    if (analysis.keyPoints && analysis.keyPoints.length > 0) {
      summary += `The document appears to serve as a reference or listing, with ${analysis.keyPoints.length} distinct key points identified through analysis.`;
    } else {
      summary += `The document serves as an informational reference, containing structured data that may be part of a larger academic or administrative system.`;
    }
    
    return `📋 **Enhanced Detailed Summary**\n\n${summary}\n\n📊 **Document Analysis:**\n• Word Count: ${wordCount} words\n• Sentences: ${sentences.length}\n• Document Type: ${analysis.documentType}\n• Academic Themes: ${themes.length > 0 ? themes.join(', ') : 'General academic content'}\n• Analysis Method: Advanced rule-based processing\n• Content Structure: ${wordCount < 50 ? 'Concise listing' : wordCount < 200 ? 'Structured information' : 'Comprehensive document'}`;
  }

  async extractKeyInformation(text, analysis) {
    try {
      // Use OpenAI for better key information extraction if available
      if (this.aiAnalyzer.openai) {
        const completion = await this.aiAnalyzer.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional information extractor. Extract the most important facts, figures, names, dates, and key concepts from documents."
            },
            {
              role: "user",
              content: `Please extract all key information from this document including:\n- Important names, dates, and numbers\n- Key facts and figures\n- Main concepts and topics\n- Action items or conclusions\n\nDocument:\n${text.substring(0, 3000)}${text.length > 3000 ? '...' : ''}`
            }
          ],
          max_tokens: 800,
          temperature: 0.2
        });

        const keyInfo = completion.choices[0].message.content;
        return `🔍 **Key Information Extracted**\n\n${keyInfo}`;
      } else {
        // Enhanced fallback key information extraction
        return this.performAdvancedKeyExtraction(text, analysis);
      }
    } catch (error) {
      console.error('❌ Error extracting key information:', error);
      // Use enhanced fallback on error
      return this.performAdvancedKeyExtraction(text, analysis);
    }
  }

  performAdvancedKeyExtraction(text, analysis) {
    const keyInfo = [];
    
    // Clean up text for better processing
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Extract academic courses and subjects
    const courses = cleanText.match(/[A-Z]{2,3}\s*\d{3,4}[A-Z]?|Introduction to [A-Z][a-z\s]+|[A-Z][a-z\s]+(Studies|Science|Engineering|Administration|Relations|Politics|Analysis)/gi);
    if (courses && courses.length > 0) {
      const uniqueCourses = [...new Set(courses)].slice(0, 8);
      keyInfo.push(`� **Academic Courses/Subjects:**\n${uniqueCourses.map(course => `• ${course.trim()}`).join('\n')}`);
    }
    
    // Extract semesters and academic terms
    const semesters = cleanText.match(/(First|Second|Third|Fourth|1st|2nd|3rd|4th)\s+(Semester|Term|Year)/gi);
    if (semesters && semesters.length > 0) {
      keyInfo.push(`📅 **Academic Terms:** ${[...new Set(semesters)].join(', ')}`);
    }
    
    // Extract numbers and codes
    const numbers = cleanText.match(/\b\d{3,4}\b|\b[A-Z]{2,4}\s*\d{3,4}\b/g);
    if (numbers && numbers.length > 0) {
      const uniqueNumbers = [...new Set(numbers)].slice(0, 10);
      keyInfo.push(`� **Course Codes/Numbers:** ${uniqueNumbers.join(', ')}`);
    }
    
    // Extract department codes
    const deptCodes = cleanText.match(/\b[A-Z]{2,4}(?=\s*\d)|POL|EE|CS|MATH|PHYS|CHEM|BIO|ENG/gi);
    if (deptCodes && deptCodes.length > 0) {
      const uniqueDepts = [...new Set(deptCodes.map(d => d.toUpperCase()))].slice(0, 6);
      keyInfo.push(`� **Department Codes:** ${uniqueDepts.join(', ')}`);
    }
    
    // Extract important titles and headers
    const titles = cleanText.match(/^[A-Z][A-Z\s]{5,}$|[A-Z][a-z\s]+(to|and|of|in)\s+[A-Z][a-z\s]+/gm);
    if (titles && titles.length > 0) {
      const uniqueTitles = [...new Set(titles)].slice(0, 5);
      keyInfo.push(`📋 **Key Titles/Headers:**\n${uniqueTitles.map(title => `• ${title.trim()}`).join('\n')}`);
    }
    
    // Extract proper nouns and names
    const properNouns = cleanText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    if (properNouns && properNouns.length > 0) {
      const filtered = properNouns.filter(noun => 
        noun.length > 3 && 
        !['The', 'And', 'Or', 'But', 'For', 'Not', 'With', 'To', 'In', 'On', 'At'].includes(noun)
      );
      const uniqueNouns = [...new Set(filtered)].slice(0, 8);
      keyInfo.push(`🏷️ **Important Terms:** ${uniqueNouns.join(', ')}`);
    }
    
    // Include document statistics
    const wordCount = cleanText.split(/\s+/).length;
    const sentenceCount = cleanText.split(/[.!?]+/).length - 1;
    keyInfo.push(`📊 **Document Stats:** ${wordCount} words, ${sentenceCount} sentences, ${analysis.documentType}`);
    
    // Include original key points if available
    if (analysis.keyPoints && analysis.keyPoints.length > 0) {
      const cleanKeyPoints = analysis.keyPoints.filter(point => point.trim().length > 3);
      if (cleanKeyPoints.length > 0) {
        keyInfo.push(`📌 **Extracted Key Points:**\n${cleanKeyPoints.map(point => `• ${point.trim()}`).join('\n')}`);
      }
    }
    
    const result = keyInfo.length > 0 ? keyInfo.join('\n\n') : 'No significant key information could be extracted from this document.';
    
    return `🔍 **Advanced Key Information Extraction**\n\n${result}`;
  }

  async sendAnalysisResults(chatId, analysis, replyToId) {
    const isCV = analysis.documentType === 'Resume/CV';
    
    let message = `
🔮 **Professional Analysis Complete**

� **Summary:**
${analysis.summary}

🌟 **Key Insights:**
${analysis.keyPoints.map(point => `✨ ${point}`).join('\n')}

📊 **Document Type:** ${analysis.documentType}
� **Word Count:** ${analysis.wordCount} words
⏰ **Processed:** ${new Date().toLocaleString()}
    `;

    // Add CV-specific information
    if (isCV && analysis.atsScore) {
      message += `\n🎯 **ATS Score:** ${analysis.atsScore}/100`;
      if (analysis.careerLevel) {
        message += `\n👑 **Career Level:** ${analysis.careerLevel}`;
      }
    }

    const keyboard = {
      inline_keyboard: isCV ? [
        [
          { text: '💎 Improve CV', callback_data: 'improve_cv' },
          { text: '🌟 Cover Letter', callback_data: 'generate_cover_letter' }
        ],
        [
          { text: '⭐ ATS Analysis', callback_data: 'ats_analysis' },
          { text: '🔮 Detailed Summary', callback_data: 'get_summary' }
        ],
        [
          { text: '✨ Extract Key Info', callback_data: 'extract_key_info' }
        ]
      ] : [
        [
          { text: '� Analyze Another', callback_data: 'analyze_more' },
          { text: '� Detailed Summary', callback_data: 'get_summary' }
        ],
        [
          { text: '✨ Extract Key Info', callback_data: 'extract_key_info' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, {
      reply_markup: keyboard,
      reply_to_message_id: replyToId
    });
  }

  async sendImageAnalysisResults(chatId, analysis, ocrResult, replyToId) {
    // Store image processing data for potential PDF creation
    await this.conversationManager.setUserData(chatId, 'lastProcessedImage', {
      text: analysis,
      ocrResult: ocrResult,
      timestamp: Date.now(),
      originalImagePath: this.conversationManager.getUserData(chatId, 'lastImagePath')
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💎 Create PDF from Image', callback_data: 'image_to_pdf' },
          { text: '📄 Generate Text PDF', callback_data: 'text_to_pdf' }
        ],
        [
          { text: '🔍 Analyze More Images', callback_data: 'analyze_more' },
          { text: '🏠 Main Menu', callback_data: 'main_menu' }
        ]
      ]
    };

    const message = `🔮 **MidDexBot Image Analysis**\n\n${analysis}`;
    await this.bot.sendMessage(chatId, message, {
      reply_markup: keyboard,
      reply_to_message_id: replyToId
    });
  }

  async sendCVImprovement(chatId, improvement) {
    const message = `
💎 **CV Improvement Complete**

${improvement.success ? improvement.improvedCV : 'CV improvement analysis completed'}

🌟 **Improvement Suggestions:**
${improvement.improvements.map(tip => `✨ ${tip}`).join('\n')}

⭐ **ATS Score:** ${improvement.atsScore}/100

🎯 **Next Steps:**
• Download the improved version
• Customize for specific roles
• Review formatting and layout
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌟 Generate Cover Letter', callback_data: 'generate_cover_letter' },
          { text: '⭐ ATS Analysis', callback_data: 'ats_analysis' }
        ],
        [
          { text: '💎 Download PDF', callback_data: 'download_pdf' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  async sendCoverLetter(chatId, coverLetterData) {
    const message = `
🌟 **Professional Cover Letter Generated**

${coverLetterData.coverLetter}

💎 **Writing Tips:**
${coverLetterData.tips.map(tip => `✨ ${tip}`).join('\n')}

⭐ **Your ATS Score:** ${coverLetterData.atsScore}/100
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💎 Improve CV', callback_data: 'improve_cv' },
          { text: '⭐ ATS Analysis', callback_data: 'ats_analysis' }
        ],
        [
          { text: '🌟 Download PDF', callback_data: 'download_pdf' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  async generateATSAnalysis(text, analysis) {
    const atsScore = this.aiAnalyzer.calculateATSScore(text);
    const improvements = this.aiAnalyzer.extractImprovements(text);
    
    let scoreEmoji = '🔻';
    let scoreLevel = 'Needs Improvement';
    
    if (atsScore >= 80) {
      scoreEmoji = '⭐';
      scoreLevel = 'Excellent';
    } else if (atsScore >= 60) {
      scoreEmoji = '🌟';
      scoreLevel = 'Good';
    } else if (atsScore >= 40) {
      scoreEmoji = '💎';
      scoreLevel = 'Fair';
    }

    return `
⭐ **ATS Compatibility Analysis**

${scoreEmoji} **Score:** ${atsScore}/100 (${scoreLevel})

🔮 **Analysis Breakdown:**
✨ Contact Information: ${/email|phone/i.test(text) ? '✅ Found' : '❌ Missing'}
✨ Work Experience: ${/experience|work/i.test(text) ? '✅ Present' : '❌ Missing'}
✨ Skills Section: ${/skills/i.test(text) ? '✅ Present' : '❌ Missing'}
✨ Quantified Results: ${/\d+%|\$\d+/i.test(text) ? '✅ Found' : '❌ Missing'}
✨ Action Verbs: ${/(managed|led|developed)/i.test(text) ? '✅ Present' : '❌ Missing'}

💎 **Improvement Recommendations:**
${improvements.map(tip => `🌟 ${tip}`).join('\n')}

🎯 **ATS Optimization Tips:**
🌟 Use standard section headers
🌟 Include relevant keywords
🌟 Avoid complex formatting
🌟 Use bullet points effectively
🌟 Quantify your achievements
    `;
  }

  async generateAndSendPDF(chatId, lastDoc) {
    try {
      const timestamp = Date.now();
      let pdfResult;

      if (lastDoc.analysis.documentType === 'Resume/CV') {
        // Generate improved CV PDF
        const cvData = {
          summary: lastDoc.analysis.summary,
          keyPoints: lastDoc.analysis.keyPoints,
          atsScore: lastDoc.analysis.atsScore,
          experience: 'Experience section to be customized',
          education: 'Education section to be customized'
        };
        
        pdfResult = await this.pdfGenerator.generateCVPDF(cvData, `improved-cv-${timestamp}.pdf`);
      } else {
        // Generate general document PDF
        const docData = {
          summary: lastDoc.analysis.summary,
          keyPoints: lastDoc.analysis.keyPoints,
          documentType: lastDoc.analysis.documentType,
          content: lastDoc.text.substring(0, 2000)
        };
        
        pdfResult = await this.pdfGenerator.generateCVPDF(docData, `document-${timestamp}.pdf`);
      }

      if (pdfResult.success) {
        // Send the PDF file
        await this.bot.sendDocument(chatId, pdfResult.filePath, {
          caption: `💎 **Your Professional Document**\n\n🌟 Generated: ${new Date().toLocaleString()}\n⭐ File size: ${Math.round(pdfResult.size / 1024)}KB`
        });

        // Clean up the file after sending
        setTimeout(() => {
          this.pdfGenerator.cleanup(pdfResult.filePath);
        }, 60000); // Delete after 1 minute

        await this.bot.sendMessage(chatId, `
🔮 **PDF Generated Successfully!**

✨ Your professional document is ready
💎 Optimized for ATS systems
🌟 Clean, modern formatting
⭐ Ready for job applications

🎯 **Next Steps:**
🌟 Customize for specific roles
💎 Add your personal details
✨ Review and adjust content
        `);
      } else {
        await this.bot.sendMessage(chatId, '🔻 Sorry, there was an error generating your PDF. Please try again.');
      }
    } catch (error) {
      console.error('🔻 PDF generation error:', error);
      await this.bot.sendMessage(chatId, '🔻 Sorry, there was an error generating your PDF. Please try again.');
    }
  }

  async generateTextToPDF(chatId, lastDoc) {
    try {
      const timestamp = Date.now();
      const isCV = this.detectCVContent(lastDoc.text);
      
      let pdfData;
      if (isCV) {
        // Structure as CV
        pdfData = {
          summary: lastDoc.analysis.summary,
          keyPoints: lastDoc.analysis.keyPoints,
          atsScore: lastDoc.analysis.atsScore,
          originalContent: lastDoc.text,
          type: 'CV from Text'
        };
      } else {
        // Structure as general document
        pdfData = {
          title: 'Professional Document',
          content: lastDoc.text,
          summary: lastDoc.analysis.summary,
          keyPoints: lastDoc.analysis.keyPoints,
          type: 'Text Document'
        };
      }
      
      const pdfResult = await this.pdfGenerator.generateTextToPDF(pdfData, `text-to-pdf-${timestamp}.pdf`);

      if (pdfResult.success) {
        // Send the PDF file
        await this.bot.sendDocument(chatId, pdfResult.filePath, {
          caption: `🔮 **Your Professional PDF**\n\n💎 Generated from your text\n🌟 Professional formatting applied\n⭐ File size: ${Math.round(pdfResult.size / 1024)}KB\n\n✨ Ready for sharing or printing!`
        });

        // Clean up the file after sending
        setTimeout(() => {
          this.pdfGenerator.cleanup(pdfResult.filePath);
        }, 60000);

        // Offer additional options
        const keyboard = {
          inline_keyboard: [
            [
              { text: '🌟 Create Cover Letter', callback_data: 'generate_cover_letter' },
              { text: '💎 Improve Content', callback_data: isCV ? 'improve_text_cv' : 'improve_text_content' }
            ],
            [
              { text: '✨ Share Link', callback_data: 'create_share_link' }
            ]
          ]
        };

        await this.bot.sendMessage(chatId, `
🔮 **PDF Generated Successfully!**

✨ Your text has been converted to a professional PDF
💎 Clean formatting and structure applied
🌟 Ready for professional use

🎯 **What's next?**
• Generate a matching cover letter
• Create an improved version
• Get a shareable link
        `, { reply_markup: keyboard });

      } else {
        await this.bot.sendMessage(chatId, '🔻 Sorry, there was an error generating your PDF. Please try again.');
      }
    } catch (error) {
      console.error('🔻 Text to PDF conversion error:', error);
      await this.bot.sendMessage(chatId, '🔻 Sorry, there was an error converting your text to PDF. Please try again.');
    }
  }

  async generateImageToPDF(chatId, imageFileId, imageData) {
    try {
      const timestamp = Date.now();
      
      // Download the image from Telegram
      const fileInfo = await this.bot.getFile(imageFileId);
      const imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;
      
      // Generate PDF with the image
      const pdfResult = await this.pdfGenerator.generateImageToPDF({
        imageUrl: imageUrl,
        text: imageData.text || 'Image processed by MidDexBot',
        analysis: imageData.ocrResult ? imageData.ocrResult.text : '',
        timestamp: new Date().toLocaleString()
      }, `image-to-pdf-${timestamp}.pdf`);

      if (pdfResult.success) {
        // Send the PDF file
        await this.bot.sendDocument(chatId, pdfResult.filePath, {
          caption: `📷 **Your Image PDF**\n\n💎 Image converted to professional PDF\n🔍 OCR text ${imageData.ocrResult ? 'included' : 'not available'}\n⭐ File size: ${Math.round(pdfResult.size / 1024)}KB\n\n✨ Perfect for archiving or sharing!`
        });

        // Clean up the file after sending
        setTimeout(() => {
          this.pdfGenerator.cleanup(pdfResult.filePath);
        }, 60000);

        // Offer additional options
        const keyboard = {
          inline_keyboard: [
            [
              { text: '📷 Process Another Image', callback_data: 'analyze_more' },
              { text: '📄 Convert Text to PDF', callback_data: 'text_to_pdf' }
            ],
            [
              { text: '🏠 Main Menu', callback_data: 'main_menu' }
            ]
          ]
        };

        await this.bot.sendMessage(chatId, `
📷 **Image PDF Generated Successfully!**

💎 Your image has been converted to a professional PDF
🔍 ${imageData.ocrResult && imageData.ocrResult.text ? 'Text extracted and included' : 'Image preserved in high quality'}
🌟 Ready for sharing or printing

🎯 **What's next?**
• Process another image
• Convert more text to PDF
• Return to main menu
        `, { reply_markup: keyboard });

      } else {
        await this.bot.sendMessage(chatId, '🔻 Sorry, there was an error generating your PDF. Please try again.');
      }
    } catch (error) {
      console.error('🔻 Image to PDF conversion error:', error);
      await this.bot.sendMessage(chatId, '🔻 Sorry, there was an error converting your image to PDF. Please try again.');
    }
  }

  async sendImprovedTextContent(chatId, improvement, contentType = 'Content') {
    const message = `
💎 **${contentType} Improvement Complete**

🌟 **Improved Content:**
${improvement.success ? improvement.improvedCV : 'Content has been analyzed and improved'}

✨ **Key Improvements:**
${improvement.improvements.map(tip => `💎 ${tip}`).join('\n')}

${improvement.atsScore ? `⭐ **ATS Score:** ${improvement.atsScore}/100\n` : ''}
🎯 **Next Steps:**
• Convert to professional PDF
• Generate matching cover letter
• Customize for specific opportunities
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💎 Create PDF', callback_data: 'text_to_pdf' },
          { text: '🌟 Cover Letter', callback_data: 'generate_cover_letter' }
        ],
        [
          { text: '✨ Share Results', callback_data: 'create_share_link' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  async improveGeneralTextContent(chatId, lastDoc) {
    try {
      let improvedContent;
      
      if (this.aiAnalyzer.openai) {
        const completion = await this.aiAnalyzer.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional content editor. Improve the text by enhancing clarity, flow, grammar, and professional tone while maintaining the original meaning."
            },
            {
              role: "user",
              content: `Please improve this content:\n\n${lastDoc.text.substring(0, 2000)}\n\nFocus on:\n1. Grammar and clarity\n2. Professional tone\n3. Better structure\n4. Enhanced readability`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        });

        improvedContent = completion.choices[0].message.content;
      } else {
        improvedContent = "Content has been analyzed. Consider improving grammar, structure, and professional tone.";
      }

      const message = `
🌟 **Content Improvement Complete**

💎 **Enhanced Version:**
${improvedContent}

✨ **Suggested Improvements:**
🔮 Enhanced professional tone
💎 Improved grammar and clarity
🌟 Better structure and flow
⭐ Increased readability

🎯 **Next Steps:**
• Convert to professional PDF
• Share with others
• Use in professional contexts
      `;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '💎 Create PDF', callback_data: 'text_to_pdf' },
            { text: '✨ Share Results', callback_data: 'create_share_link' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });

    } catch (error) {
      console.error('🔻 Content improvement error:', error);
      await this.bot.sendMessage(chatId, '🔻 Sorry, there was an error improving your content. Please try again.');
    }
  }

  async showCVToolsMenu(chatId) {
    const message = `
💎 **CV & Career Tools**

Choose what you'd like to do:
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💎 Improve CV', callback_data: 'show_cv_options' },
          { text: '🌟 Cover Letter', callback_data: 'show_cover_options' }
        ],
        [
          { text: '⭐ ATS Score', callback_data: 'show_ats_options' },
          { text: '🔮 Analyze Document', callback_data: 'show_analyze_options' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  async showStudyAssistantMenu(chatId) {
    const message = `
🧠 **Study Assistant**

Choose your learning tool:
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔍 Research Assistant', callback_data: 'start_research' },
          { text: '📝 Smart Notes', callback_data: 'start_notes' }
        ],
        [
          { text: '📚 Homework Help', callback_data: 'start_homework' },
          { text: '📅 Study Planner', callback_data: 'start_study_plan' }
        ],
        [
          { text: '⏰ Study Timer', callback_data: 'start_timer' },
          { text: '📊 Study Progress', callback_data: 'show_progress' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  async sendResearchResults(chatId, research) {
    const message = `
🔍 **Research Results**

**Topic:** ${research.query}

${research.research}

🌟 **Key Topics Identified:**
${research.keyTopics.map(topic => `• ${topic}`).join('\n')}

⏰ **Generated:** ${research.timestamp.toLocaleString()}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📝 Create Notes', callback_data: 'research_to_notes' },
          { text: '💾 Save as PDF', callback_data: 'research_to_pdf' }
        ],
        [
          { text: '🔍 Research More', callback_data: 'start_research' },
          { text: '📚 Related Homework', callback_data: 'start_homework' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  async sendSmartNotes(chatId, notes) {
    const message = `
📝 **Smart Notes Created**

**Topic:** ${notes.topic}

${notes.notes}

📊 **Stats:**
• Word Count: ${notes.wordCount}
• Sections: ${notes.sections.length}
• Created: ${notes.timestamp.toLocaleString()}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💾 Save as PDF', callback_data: 'notes_to_pdf' },
          { text: '📚 Study Quiz', callback_data: 'create_quiz' }
        ],
        [
          { text: '🔍 Research More', callback_data: 'start_research' },
          { text: '⏰ Start Timer', callback_data: 'start_timer' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  async sendHomeworkHelp(chatId, help) {
    const message = `
📚 **Homework Help**

**Problem:** ${help.problem}
**Subject:** ${help.subject}

${help.explanation}

🎯 **Key Concepts:**
${help.concepts.map(concept => `• ${concept}`).join('\n')}

⏰ **Analyzed:** ${help.timestamp.toLocaleString()}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📝 Take Notes', callback_data: 'homework_to_notes' },
          { text: '🔍 Research Topic', callback_data: 'homework_to_research' }
        ],
        [
          { text: '📚 More Help', callback_data: 'start_homework' },
          { text: '⏰ Study Timer', callback_data: 'start_timer' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  async showStudyPlanOptions(chatId) {
    const message = `
📅 **Study Plan Creator**

Let's create a personalized study plan for you!

What subjects are you focusing on? 
(Reply with subjects separated by commas)

Example: "Math, Science, History, English"
    `;

    // Store that user is in study plan creation mode
    const user = await this.databaseService.findOrCreateUser({ id: chatId });
    await this.databaseService.updateConversationData(user.id, {
      mode: 'study_plan_creation',
      step: 'subjects',
      timestamp: new Date()
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📚 Common Subjects', callback_data: 'suggest_subjects' },
          { text: '🎯 Custom Plan', callback_data: 'custom_study_plan' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  isResearchQuery(text) {
    const researchKeywords = [
      'what is', 'how does', 'why does', 'explain', 'tell me about',
      'research', 'find information', 'learn about', 'study about',
      'help me understand', 'what are', 'how to', 'when did'
    ];
    
    const textLower = text.toLowerCase();
    return researchKeywords.some(keyword => textLower.includes(keyword)) && text.length > 10;
  }

  async handleStudyPlanCreation(chatId, text, session) {
    if (session.step === 'subjects') {
      const subjects = text.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      if (subjects.length > 0) {
        const user = await this.databaseService.getUserByTelegramId(chatId);
        await this.databaseService.updateConversationData(user.id, {
          ...session,
          subjects: subjects,
          step: 'timeframe'
        });
        
        const keyboard = {
          inline_keyboard: [
            [
              { text: '🚀 Intensive (6hrs/day)', callback_data: 'timeframe_intensive' },
              { text: '📚 Regular (4hrs/day)', callback_data: 'timeframe_regular' }
            ],
            [
              { text: '⏰ Light (2hrs/day)', callback_data: 'timeframe_light' }
            ]
          ]
        };

        await this.bot.sendMessage(chatId, `Great! I'll create a study plan for: ${subjects.join(', ')}\n\nHow intensive would you like your study schedule?`, { reply_markup: keyboard });
      } else {
        await this.bot.sendMessage(chatId, '❌ Please provide at least one subject. Example: "Math, Science"');
      }
    }
  }

  async generateResearchPDF(chatId, researchData) {
    try {
      const timestamp = Date.now();
      const pdfData = {
        title: `Research: ${researchData.query}`,
        content: researchData.research,
        keyPoints: researchData.keyTopics,
        type: 'Research Document'
      };
      
      const pdfResult = await this.pdfGenerator.generateTextToPDF(pdfData, `research-${timestamp}.pdf`);

      if (pdfResult.success) {
        await this.bot.sendDocument(chatId, pdfResult.filePath, {
          caption: `🔍 **Research PDF Generated**\n\n💎 Topic: ${researchData.query}\n🌟 Professional formatting applied\n⭐ Size: ${Math.round(pdfResult.size / 1024)}KB`
        });

        setTimeout(() => this.pdfGenerator.cleanup(pdfResult.filePath), 60000);
      }
    } catch (error) {
      console.error('🔻 Research PDF error:', error);
      await this.bot.sendMessage(chatId, '🔻 Sorry, there was an error generating the research PDF.');
    }
  }

  async generateNotesPDF(chatId, notesData) {
    try {
      const timestamp = Date.now();
      const pdfData = {
        title: `Study Notes: ${notesData.topic}`,
        content: notesData.notes,
        sections: notesData.sections,
        type: 'Study Notes'
      };
      
      const pdfResult = await this.pdfGenerator.generateTextToPDF(pdfData, `notes-${timestamp}.pdf`);

      if (pdfResult.success) {
        await this.bot.sendDocument(chatId, pdfResult.filePath, {
          caption: `📝 **Study Notes PDF Generated**\n\n💎 Topic: ${notesData.topic}\n🌟 Professional study format\n⭐ Size: ${Math.round(pdfResult.size / 1024)}KB`
        });

        setTimeout(() => this.pdfGenerator.cleanup(pdfResult.filePath), 60000);
      }
    } catch (error) {
      console.error('🔻 Notes PDF error:', error);
      await this.bot.sendMessage(chatId, '🔻 Sorry, there was an error generating the notes PDF.');
    }
  }

  async sendStudyPlan(chatId, studyPlan) {
    let message = `
📅 **Your Personalized Study Plan**

🎯 **Subjects:** ${studyPlan.studyPlan.subjects.join(', ')}
⏰ **Schedule Type:** ${studyPlan.studyPlan.timeframe}
📅 **Created:** ${studyPlan.studyPlan.createdAt.toLocaleString()}

📚 **Daily Schedule:**
${studyPlan.schedule.map(item => 
  `• **${item.subject}**: ${item.dailyHours} hours\n  Times: ${item.suggestedTimes.join(', ')}`
).join('\n\n')}

💡 **Study Tips:**
${studyPlan.tips.map(tip => `✨ ${tip}`).join('\n')}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '⏰ Start Timer', callback_data: 'start_timer' },
          { text: '📝 Take Notes', callback_data: 'start_notes' }
        ],
        [
          { text: '🔍 Research Topics', callback_data: 'start_research' },
          { text: '💾 Save as PDF', callback_data: 'plan_to_pdf' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  // === CRYPTO METHODS ===
  async showCryptoMainMenu(chatId) {
    const message = `💰 *Crypto Dashboard*\n\n📊 *Available Features:*\n• Real-time price tracking\n• Price alerts and notifications\n• Latest crypto news\n• Personal watchlist management\n• Portfolio & inventory tracking\n• Market sentiment analysis\n• Top cryptocurrencies by market cap\n\n🎯 *Quick Actions:*`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '📈 Top Cryptos', callback_data: 'crypto_top' }, { text: '🔥 Trending', callback_data: 'crypto_trending' }],
        [{ text: '🔍 Search Coin', callback_data: 'crypto_search' }, { text: '📰 Latest News', callback_data: 'crypto_news_all' }],
        [{ text: '👁️ My Watchlist', callback_data: 'watchlist_view' }, { text: '🚨 My Alerts', callback_data: 'alerts_view' }],
        [{ text: '📊 My Portfolio', callback_data: 'inventory_view' }, { text: '💰 Buy/Sell', callback_data: 'inventory_buy' }]
      ]
    };

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
  }

  async handleCryptoSearch(chatId, query) {
    try {
      await this.bot.sendMessage(chatId, `🔍 Searching for "${query}"...`);
      const searchResults = await this.cryptoService.searchCoins(query);
      
      if (searchResults.length === 0) {
        await this.bot.sendMessage(chatId, `❌ No cryptocurrencies found for "${query}".`);
        return;
      }

      if (searchResults.length === 1) {
        await this.showCoinDetails(chatId, searchResults[0].id);
      } else {
        let message = `🔍 *Search Results for "${query}":*\n\n`;
        const keyboard = { inline_keyboard: searchResults.slice(0, 8).map(coin => 
          [{ text: `${coin.symbol} - ${coin.name}`, callback_data: `crypto_details_${coin.id}` }]
        )};
        
        searchResults.slice(0, 8).forEach((coin, index) => {
          message += `${index + 1}. *${coin.symbol}* - ${coin.name}\n`;
        });

        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
      }
    } catch (error) {
      console.error('Crypto search error:', error);
      await this.bot.sendMessage(chatId, '❌ Error searching for cryptocurrency.');
    }
  }

  async showCoinDetails(chatId, coinId) {
    try {
      await this.bot.sendMessage(chatId, '📊 Fetching coin details...');
      const coinDetails = await this.cryptoService.getCoinDetails(coinId);
      
      const price = this.cryptoService.formatPrice(coinDetails.current_price);
      const marketCap = this.cryptoService.formatLargeNumber(coinDetails.market_cap);
      const change24h = this.cryptoService.formatPercentage(coinDetails.price_change_percentage_24h);

      const message = `💰 *${coinDetails.symbol} - ${coinDetails.name}*\n\n💵 *Price:* ${price}\n📊 *Market Cap:* ${marketCap}\n📈 *24h Change:* ${change24h}\n📋 *Rank:* #${coinDetails.market_cap_rank}`;

      const keyboard = {
        inline_keyboard: [
          [{ text: '➕ Add to Watchlist', callback_data: `watchlist_add_${coinId}` }, { text: '🚨 Set Alert', callback_data: `alert_create_${coinId}` }],
          [{ text: '📰 Coin News', callback_data: `crypto_news_${coinId}` }]
        ]
      };

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
    } catch (error) {
      console.error('Coin details error:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching coin details.');
    }
  }

  async handleCryptoNews(chatId, coinId = null) {
    try {
      await this.bot.sendMessage(chatId, '📰 Fetching crypto news...');
      const news = coinId ? await this.cryptoNewsService.getCoinNews(coinId, 3) : await this.cryptoNewsService.getCryptoNews(3);
      
      if (news.length === 0) {
        await this.bot.sendMessage(chatId, '📰 No recent news available.');
        return;
      }

      const message = this.cryptoNewsService.formatNewsListForTelegram(news, true);
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', disable_web_page_preview: true });
    } catch (error) {
      console.error('Crypto news error:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching crypto news.');
    }
  }

  async showCryptoAlertMenu(chatId) {
    const message = `🚨 *Crypto Alerts Dashboard*\n\nSet price alerts to get notified when cryptocurrencies reach your target prices!`;
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '➕ Create Alert', callback_data: 'alert_create' }, { text: '👁️ View Alerts', callback_data: 'alerts_view' }],
        [{ text: '🔙 Back to Crypto', callback_data: 'crypto_main' }]
      ]
    };

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
  }

  async showWatchlistMenu(chatId) {
    try {
      const user = await this.databaseService.findOrCreateUser({ id: chatId });
      const { UserCryptoWatchlist } = require('./models');
      const watchlist = await UserCryptoWatchlist.getUserWatchlist(user.id, 10);
      
      if (watchlist.length === 0) {
        const message = `👁️ *Your Crypto Watchlist*\n\n📭 Your watchlist is empty. Add cryptocurrencies to track their prices!`;
        const keyboard = { inline_keyboard: [[{ text: '➕ Add Coin', callback_data: 'watchlist_add' }]] };
        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
        return;
      }

      const coinIds = watchlist.map(item => item.coin_id);
      const prices = await this.cryptoService.getCryptoPrices(coinIds);
      let message = `👁️ *Your Crypto Watchlist*\n\n`;

      for (const item of watchlist) {
        const coinPrice = prices[item.coin_id];
        if (coinPrice) {
          const price = this.cryptoService.formatPrice(coinPrice.usd);
          const change = this.cryptoService.formatPercentage(coinPrice.usd_24h_change);
          message += `${item.position}. *${item.coin_symbol}* - ${price} ${change}\n`;
        }
      }

      const keyboard = { inline_keyboard: [[{ text: '➕ Add Coin', callback_data: 'watchlist_add' }, { text: '🔄 Refresh', callback_data: 'watchlist_refresh' }]] };
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
    } catch (error) {
      console.error('Watchlist error:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading watchlist.');
    }
  }

  async addCoinToWatchlist(chatId, coinIdOrSymbol) {
    try {
      const user = await this.databaseService.findOrCreateUser({ id: chatId });
      const { UserCryptoWatchlist } = require('./models');

      // Search for the coin first
      const searchResults = await this.cryptoService.searchCoins(coinIdOrSymbol);
      
      if (searchResults.length === 0) {
        await this.bot.sendMessage(chatId, `❌ Could not find cryptocurrency "${coinIdOrSymbol}". Please try again with a different name or symbol.`);
        return;
      }

      const coin = searchResults[0]; // Take the first result
      const coinId = coin.id;
      
      // Get current price
      const priceData = await this.cryptoService.getCryptoPrices([coinId]);
      const currentPrice = priceData[coinId]?.usd || null;

      try {
        await UserCryptoWatchlist.addToWatchlist(user.id, {
          coinId: coin.id,
          coinSymbol: coin.symbol,
          coinName: coin.name,
          currentPrice
        });

        const price = currentPrice ? this.cryptoService.formatPrice(currentPrice) : 'Price unavailable';
        const message = `✅ *${coin.symbol.toUpperCase()}* (${coin.name}) added to your watchlist!\n\n💰 Current price: ${price}`;
        
        const keyboard = {
          inline_keyboard: [
            [{ text: '👁️ View Watchlist', callback_data: 'watchlist_view' }],
            [{ text: '🚨 Set Alert', callback_data: `alert_create_${coinId}` }]
          ]
        };

        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
      } catch (error) {
        if (error.message.includes('already in your watchlist')) {
          await this.bot.sendMessage(chatId, `❌ ${coin.symbol.toUpperCase()} is already in your watchlist.`);
        } else {
          console.error('Error adding to watchlist:', error);
          await this.bot.sendMessage(chatId, '❌ Error adding coin to watchlist. Please try again.');
        }
      }
    } catch (error) {
      console.error('Watchlist add error:', error);
      await this.bot.sendMessage(chatId, '❌ Error adding coin to watchlist. Please try again.');
    }
  }

  async showInventoryMenu(chatId) {
    try {
      const user = await this.databaseService.findOrCreateUser({ id: chatId });
      const portfolio = await this.cryptoInventoryService.getPortfolioSummary(user.id);
      
      const message = this.cryptoInventoryService.formatPortfolioForTelegram(portfolio);
      
      const keyboard = {
        inline_keyboard: [
          [{ text: '📊 Portfolio Details', callback_data: 'inventory_details' }, { text: '📈 Analytics', callback_data: 'inventory_analytics' }],
          [{ text: '💰 Buy Crypto', callback_data: 'inventory_buy' }, { text: '💸 Sell Crypto', callback_data: 'inventory_sell' }],
          [{ text: '📋 Transaction History', callback_data: 'inventory_history' }, { text: '🔄 Refresh', callback_data: 'inventory_refresh' }]
        ]
      };
      
      await this.bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2', reply_markup: keyboard });
    } catch (error) {
      console.error('Inventory menu error:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading portfolio. Please try again.');
    }
  }

  async initiateBuyTransaction(chatId, coinQuery) {
    try {
      // Search for the coin
      const searchResults = await this.cryptoService.searchCoins(coinQuery);
      
      if (searchResults.length === 0) {
        await this.bot.sendMessage(chatId, `❌ Could not find cryptocurrency "${coinQuery}". Please try again with a different name or symbol.`);
        return;
      }

      const coin = searchResults[0];
      const priceData = await this.cryptoService.getCryptoPrices([coin.id]);
      const currentPrice = priceData[coin.id]?.usd || 0;
      
      const message = `💰 *Buy ${coin.symbol.toUpperCase()}* (${coin.name})\n\n💵 Current Price: ${this.cryptoService.formatPrice(currentPrice)}\n\nPlease enter your transaction details in this format:\n\n\`quantity,price_per_unit,exchange,notes\`\n\nExample: \`0.1,50000,Binance,DCA purchase\``;
      
      // Store the buy session data
      const user = await this.databaseService.findOrCreateUser({ id: chatId });
      await this.databaseService.updateConversationData(user.id, {
        mode: 'buy_transaction',
        coin_id: coin.id,
        coin_symbol: coin.symbol,
        coin_name: coin.name,
        current_price: currentPrice
      });
      
      await this.bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: { force_reply: true }
      });
    } catch (error) {
      console.error('Buy transaction error:', error);
      await this.bot.sendMessage(chatId, '❌ Error initiating buy transaction. Please try again.');
    }
  }

  async initiateSellTransaction(chatId, coinQuery) {
    try {
      const user = await this.databaseService.findOrCreateUser({ id: chatId });
      
      // Search for the coin
      const searchResults = await this.cryptoService.searchCoins(coinQuery);
      
      if (searchResults.length === 0) {
        await this.bot.sendMessage(chatId, `❌ Could not find cryptocurrency "${coinQuery}". Please try again with a different name or symbol.`);
        return;
      }

      const coin = searchResults[0];
      
      // Check current holdings
      const holding = await this.cryptoInventoryService.getCoinHolding(user.id, coin.id);
      
      if (!holding || holding.total_quantity <= 0) {
        await this.bot.sendMessage(chatId, `❌ You don't have any ${coin.symbol.toUpperCase()} to sell. Your current balance: ${holding?.total_quantity || 0}`);
        return;
      }

      const priceData = await this.cryptoService.getCryptoPrices([coin.id]);
      const currentPrice = priceData[coin.id]?.usd || 0;
      
      const message = `💸 *Sell ${coin.symbol.toUpperCase()}* (${coin.name})\n\n💵 Current Price: ${this.cryptoService.formatPrice(currentPrice)}\n📊 Available: ${holding.total_quantity} ${coin.symbol.toUpperCase()}\n\nPlease enter your transaction details in this format:\n\n\`quantity,price_per_unit,exchange,notes\`\n\nExample: \`0.05,52000,Binance,Taking profits\``;
      
      // Store the sell session data
      await this.databaseService.updateConversationData(user.id, {
        mode: 'sell_transaction',
        coin_id: coin.id,
        coin_symbol: coin.symbol,
        coin_name: coin.name,
        current_price: currentPrice,
        available_quantity: holding.total_quantity
      });
      
      await this.bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: { force_reply: true }
      });
    } catch (error) {
      console.error('Sell transaction error:', error);
      await this.bot.sendMessage(chatId, '❌ Error initiating sell transaction. Please try again.');
    }
  }

  async processBuyTransaction(chatId, transactionInput, sessionData) {
    try {
      const parts = transactionInput.split(',').map(p => p.trim());
      
      if (parts.length < 2) {
        await this.bot.sendMessage(chatId, '❌ Invalid format. Please use: `quantity,price_per_unit,exchange,notes`', { parse_mode: 'Markdown' });
        return;
      }

      const [quantity, pricePerUnit, exchange = '', notes = ''] = parts;
      
      if (isNaN(quantity) || isNaN(pricePerUnit) || parseFloat(quantity) <= 0 || parseFloat(pricePerUnit) <= 0) {
        await this.bot.sendMessage(chatId, '❌ Quantity and price must be valid positive numbers.');
        return;
      }

      const user = await this.databaseService.findOrCreateUser({ id: chatId });
      
      const transactionData = {
        coinId: sessionData.coin_id,
        coinSymbol: sessionData.coin_symbol,
        coinName: sessionData.coin_name,
        quantity: parseFloat(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        exchange: exchange || null,
        notes: notes || null
      };

      const result = await this.cryptoInventoryService.buyPosition(user.id, transactionData);
      
      const totalValue = parseFloat(quantity) * parseFloat(pricePerUnit);
      const message = `✅ *Buy Order Recorded*\n\n💰 ${result.transaction.coin_symbol}: ${quantity} units\n💵 Price: ${this.cryptoService.formatPrice(parseFloat(pricePerUnit))}\n💸 Total: ${this.cryptoService.formatPrice(totalValue)}\n🏢 Exchange: ${exchange || 'Not specified'}\n📝 Notes: ${notes || 'None'}`;
      
      const keyboard = {
        inline_keyboard: [
          [{ text: '📊 View Portfolio', callback_data: 'inventory_view' }],
          [{ text: '🚨 Set Alert', callback_data: `alert_create_${sessionData.coin_id}` }]
        ]
      };

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
      
      // Clear session
      await this.databaseService.updateConversationData(user.id, { mode: null });
      
    } catch (error) {
      console.error('Process buy transaction error:', error);
      await this.bot.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async processSellTransaction(chatId, transactionInput, sessionData) {
    try {
      const parts = transactionInput.split(',').map(p => p.trim());
      
      if (parts.length < 2) {
        await this.bot.sendMessage(chatId, '❌ Invalid format. Please use: `quantity,price_per_unit,exchange,notes`', { parse_mode: 'Markdown' });
        return;
      }

      const [quantity, pricePerUnit, exchange = '', notes = ''] = parts;
      
      if (isNaN(quantity) || isNaN(pricePerUnit) || parseFloat(quantity) <= 0 || parseFloat(pricePerUnit) <= 0) {
        await this.bot.sendMessage(chatId, '❌ Quantity and price must be valid positive numbers.');
        return;
      }

      if (parseFloat(quantity) > sessionData.available_quantity) {
        await this.bot.sendMessage(chatId, `❌ Insufficient balance. You have ${sessionData.available_quantity} ${sessionData.coin_symbol} available.`);
        return;
      }

      const user = await this.databaseService.findOrCreateUser({ id: chatId });
      
      const transactionData = {
        coinId: sessionData.coin_id,
        coinSymbol: sessionData.coin_symbol,
        coinName: sessionData.coin_name,
        quantity: parseFloat(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        exchange: exchange || null,
        notes: notes || null
      };

      const result = await this.cryptoInventoryService.sellPosition(user.id, transactionData);
      
      const totalValue = parseFloat(quantity) * parseFloat(pricePerUnit);
      const message = `✅ *Sell Order Recorded*\n\n💸 ${result.transaction.coin_symbol}: ${quantity} units\n💵 Price: ${this.cryptoService.formatPrice(parseFloat(pricePerUnit))}\n💰 Total: ${this.cryptoService.formatPrice(totalValue)}\n🏢 Exchange: ${exchange || 'Not specified'}\n📝 Notes: ${notes || 'None'}`;
      
      const keyboard = {
        inline_keyboard: [
          [{ text: '📊 View Portfolio', callback_data: 'inventory_view' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
      
      // Clear session
      await this.databaseService.updateConversationData(user.id, { mode: null });
      
    } catch (error) {
      console.error('Process sell transaction error:', error);
      await this.bot.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async showInventoryDetails(chatId) {
    try {
      const user = await this.databaseService.findOrCreateUser({ id: chatId });
      const portfolio = await this.cryptoInventoryService.getPortfolioSummary(user.id);
      
      if (portfolio.total_coins === 0) {
        await this.bot.sendMessage(chatId, '📊 Your portfolio is empty. Start by adding your first position with /buy!');
        return;
      }

      let message = `📊 *Portfolio Details*\n\n`;
      message += `💰 Total Value: $${portfolio.total_current_value.toLocaleString()}\n`;
      message += `💸 Total Invested: $${portfolio.total_cost_basis.toLocaleString()}\n`;
      
      const pnlSymbol = portfolio.total_pnl >= 0 ? '📈' : '📉';
      const pnlSign = portfolio.total_pnl >= 0 ? '+' : '';
      message += `${pnlSymbol} P&L: ${pnlSign}$${Math.abs(portfolio.total_pnl).toLocaleString()} (${pnlSign}${portfolio.total_pnl_percentage.toFixed(2)}%)\n\n`;
      
      message += `*Holdings:*\n`;
      portfolio.holdings_with_prices.forEach((holding, index) => {
        const pnl = holding.pnl_percentage >= 0 ? '+' : '';
        message += `${index + 1}\\. *${holding.coin_symbol}*\n`;
        message += `   💰 ${holding.total_quantity} @ $${holding.current_price.toLocaleString()}\n`;
        message += `   📊 Value: $${holding.current_value.toLocaleString()} \\(${holding.allocation_percentage.toFixed(1)}%\\)\n`;
        message += `   📈 P&L: ${pnl}${holding.pnl_percentage.toFixed(1)}%\n\n`;
      });

      await this.bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
    } catch (error) {
      console.error('Portfolio details error:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading portfolio details. Please try again.');
    }
  }

  async showInventoryAnalytics(chatId) {
    try {
      const user = await this.databaseService.findOrCreateUser({ id: chatId });
      const sentiment = await this.cryptoInventoryService.getMarketSentimentAnalysis(user.id);
      
      let message = `📈 *Market Sentiment Analysis*\n\n`;
      
      const sentimentEmoji = sentiment.sentiment === 'bullish' ? '🟢' : 
                            sentiment.sentiment === 'bearish' ? '🔴' : '🟡';
      
      message += `${sentimentEmoji} *Sentiment*: ${sentiment.sentiment.toUpperCase()}\n`;
      message += `📊 *Confidence*: ${sentiment.confidence_score}%\n\n`;
      
      message += `*Recent Activity (30 days):*\n`;
      message += `🟢 Buy Transactions: ${sentiment.recent_activity.buy_transactions}\n`;
      message += `🔴 Sell Transactions: ${sentiment.recent_activity.sell_transactions}\n`;
      message += `💰 Buy Value: $${sentiment.recent_activity.total_buy_value.toLocaleString()}\n`;
      message += `💸 Sell Value: $${sentiment.recent_activity.total_sell_value.toLocaleString()}\n`;
      message += `📊 Net Flow: $${sentiment.recent_activity.net_flow.toLocaleString()}\n\n`;
      
      message += `*Market Insights:*\n`;
      message += `🔥 Trending in Portfolio: ${sentiment.market_insights.trending_in_portfolio}\n`;
      message += `📊 Portfolio Coins: ${sentiment.market_insights.portfolio_diversification}\n\n`;
      
      if (sentiment.market_insights.top_performer) {
        const top = sentiment.market_insights.top_performer;
        message += `🏆 *Top Performer*: ${top.coin_symbol}\n`;
        message += `📈 P&L: +${top.pnl_percentage.toFixed(1)}%\n\n`;
      }
      
      message += `💡 *Recommendation*: ${sentiment.recommendation}\n`;
      
      const keyboard = {
        inline_keyboard: [
          [{ text: '🔙 Back to Portfolio', callback_data: 'inventory_view' }]
        ]
      };
      
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
    } catch (error) {
      console.error('Portfolio analytics error:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading portfolio analytics. Please try again.');
    }
  }

  async showTransactionHistory(chatId, limit = 10) {
    try {
      const user = await this.databaseService.findOrCreateUser({ id: chatId });
      const transactions = await this.cryptoInventoryService.getTransactionHistory(user.id, null, limit);
      
      if (transactions.length === 0) {
        await this.bot.sendMessage(chatId, '📋 No transactions found. Start by adding your first buy/sell order!');
        return;
      }

      let message = `📋 *Transaction History*\n\n`;
      
      transactions.slice(0, 5).forEach((tx, index) => {
        const typeEmoji = tx.type === 'BUY' ? '🟢' : '🔴';
        message += `${typeEmoji} *${tx.type}* ${tx.coin}\n`;
        message += `📊 ${tx.quantity} @ ${tx.pricePerUnit}\n`;
        message += `💰 Total: ${tx.totalValue}\n`;
        if (tx.currentValue && tx.type === 'BUY') {
          const pnlEmoji = tx.isProfit ? '📈' : '📉';
          message += `${pnlEmoji} Current: ${tx.currentValue} (${tx.pnl})\n`;
        }
        message += `📅 ${tx.date}\n\n`;
      });

      if (transactions.length > 5) {
        message += `_Showing 5 of ${transactions.length} transactions_\n`;
      }

      const keyboard = {
        inline_keyboard: [
          [{ text: '🔙 Back to Portfolio', callback_data: 'inventory_view' }]
        ]
      };
      
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
    } catch (error) {
      console.error('Transaction history error:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading transaction history. Please try again.');
    }
  }

  async start() {
    try {
      // Initialize database first
      await this.databaseService.initialize();
      
      // Start crypto alert monitoring
      console.log('🚀 Starting crypto alert monitoring...');
      this.cryptoAlertMonitor.start();
      
      // Configure webhook for production
      if (this.isProduction && this.webhookUrl) {
        console.log('🔗 Setting up webhook for production...');
        await this.bot.setWebHook(`${this.webhookUrl}/webhook`);
        console.log(`✅ Webhook set to: ${this.webhookUrl}/webhook`);
      } else {
        console.log('🔄 Running in development mode with polling');
      }
      
      // Start express server
      this.app.listen(this.port, () => {
        console.log(`🤖 MidDexBot AI Assistant running on port ${this.port}`);
        console.log(`💎 Bot is active and listening for messages`);
        console.log(`🌟 Health check: http://localhost:${this.port}/health`);
        if (this.isProduction && this.webhookUrl) {
          console.log(`🔗 Webhook endpoint: ${this.webhookUrl}/webhook`);
        }
      });

      // Bot startup message
      console.log('✅ MidDexBot started successfully');
      console.log('📱 Waiting for messages...');
    } catch (error) {
      console.error('❌ Failed to start MidDexBot:', error);
      process.exit(1);
    }
  }

  // === HOMEWORK HELPER UI METHODS ===

  async showHomeworkMenu(chatId) {
    try {
      const user = await this.databaseService.getUserByTelegramId(chatId);
      const stats = user ? await this.homeworkAssistant.getHomeworkStats(user.id) : { total: 0, completed: 0, pending: 0 };
      
      const message = `
📚 *Homework Helper Dashboard*

Get instant help with your homework questions! Submit problems and receive detailed explanations with step-by-step solutions.

📊 *Your Statistics*
• Total Questions: ${stats.total}
• Completed: ${stats.completed}
• Pending: ${stats.pending}
• Average Rating: ${stats.averageRating}⭐

🎯 *What would you like to do?*
      `;

      const keyboard = {
        inline_keyboard: [
          [{ text: '❓ Ask Question', callback_data: 'homework_ask' }],
          [{ text: '📖 View History', callback_data: 'homework_history' }],
          [{ text: '📊 View Statistics', callback_data: 'homework_stats' }],
          [{ text: '❓ How It Works', callback_data: 'homework_help' }],
          [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing homework menu:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading homework dashboard. Please try again.');
    }
  }

  async showHomeworkHistory(chatId) {
    try {
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ User not found. Please start a conversation first.');
        return;
      }

      const homework = await this.homeworkAssistant.getUserHomework(user.id, { limit: 10 });

      if (homework.length === 0) {
        const message = `
📚 *My Homework History*

You haven't submitted any homework questions yet!

🌟 *Get Started:*
• Ask your first homework question
• Get instant AI-powered help
• Build your learning history

Ready to learn?
        `;

        const keyboard = {
          inline_keyboard: [
            [{ text: '❓ Ask First Question', callback_data: 'homework_ask' }],
            [{ text: '❓ How It Works', callback_data: 'homework_help' }],
            [{ text: '🔙 Back', callback_data: 'homework_main' }]
          ]
        };

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
        return;
      }

      let message = `📚 *My Homework History* (${homework.length} recent)\n\n`;

      const keyboard = { inline_keyboard: [] };

      for (const hw of homework.slice(0, 5)) {
        const shortQuestion = hw.question.length > 60 ? hw.question.substring(0, 60) + '...' : hw.question;
        message += `${hw.getSubjectEmoji()} *${this.homeworkAssistant.escapeMarkdown(hw.subject)}*\n`;
        message += `${hw.getDifficultyEmoji()} ${hw.difficulty_level} • ${hw.status}\n`;
        message += `❓ ${this.homeworkAssistant.escapeMarkdown(shortQuestion)}\n\n`;

        keyboard.inline_keyboard.push([
          { text: `📖 View #${hw.id}`, callback_data: `hw_view_${hw.id}` }
        ]);
      }

      keyboard.inline_keyboard.push(
        [{ text: '📊 View Statistics', callback_data: 'homework_stats' }],
        [{ text: '🔙 Back', callback_data: 'homework_main' }]
      );

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing homework history:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading homework history. Please try again.');
    }
  }

  async showHomeworkStats(chatId) {
    try {
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ User not found. Please start a conversation first.');
        return;
      }

      const stats = await this.homeworkAssistant.getHomeworkStats(user.id);

      let message = `📊 *Homework Statistics*\n\n`;
      message += `📈 *Overall Performance*\n`;
      message += `• Total Questions: ${stats.total}\n`;
      message += `• Completed: ${stats.completed}\n`;
      message += `• Pending: ${stats.pending}\n`;
      message += `• Success Rate: ${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%\n`;
      message += `• Average Rating: ${stats.averageRating}⭐\n\n`;

      if (Object.keys(stats.bySubject).length > 0) {
        message += `📚 *By Subject*\n`;
        Object.entries(stats.bySubject)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .forEach(([subject, count]) => {
            message += `• ${subject}: ${count}\n`;
          });
        message += '\n';
      }

      if (Object.keys(stats.byDifficulty).length > 0) {
        message += `🎯 *By Difficulty*\n`;
        Object.entries(stats.byDifficulty).forEach(([level, count]) => {
          const emoji = { beginner: '🟢', intermediate: '🟡', advanced: '🟠', expert: '🔴' }[level];
          message += `${emoji} ${level}: ${count}\n`;
        });
      }

      const keyboard = {
        inline_keyboard: [
          [{ text: '📖 View History', callback_data: 'homework_history' }],
          [{ text: '❓ Ask Question', callback_data: 'homework_ask' }],
          [{ text: '🔙 Back', callback_data: 'homework_main' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing homework stats:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading statistics. Please try again.');
    }
  }

  async showHomeworkHelp(chatId) {
    const message = `
❓ *Homework Helper Guide*

🎯 *How It Works:*
1️⃣ Submit your homework question
2️⃣ AI analyzes and provides detailed explanation
3️⃣ Get step-by-step solutions
4️⃣ Learn key concepts and get resources

📝 *Supported Question Types:*
• Multiple Choice Questions
• Mathematical Calculations
• Problem Solving
• Essay Questions
• Analysis & Interpretation
• Short Answer Questions

📚 *Supported Subjects:*
Mathematics, Physics, Chemistry, Biology, Computer Science, Engineering, History, Literature, Languages, and more!

💡 *Tips for Better Results:*
• Be specific and clear in your questions
• Include relevant context or background
• Specify the subject if it's not obvious
• Ask follow-up questions for clarification

🎓 *Features:*
• Instant AI-powered responses
• Step-by-step solution breakdowns
• Key concept explanations
• Additional learning resources
• Progress tracking and statistics

Ready to get help with your homework?
    `;

    const keyboard = {
      inline_keyboard: [
        [{ text: '❓ Ask Question Now', callback_data: 'homework_ask' }],
        [{ text: '📖 View Examples', callback_data: 'homework_examples' }],
        [{ text: '🔙 Back', callback_data: 'homework_main' }]
      ]
    };

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  async initiateHomeworkSubmission(chatId) {
    try {
      const subjects = this.homeworkAssistant.getAvailableSubjects();
      
      const message = `
❓ *Submit Homework Question*

I'm ready to help you with your homework! 

📝 *Quick Submit:*
Just type your question and I'll automatically detect the subject and difficulty level.

📚 *Or Choose Subject First:*
      `;

      const keyboard = { inline_keyboard: [] };

      // Create subject buttons (2 per row)
      const popularSubjects = subjects.slice(0, 12);
      for (let i = 0; i < popularSubjects.length; i += 2) {
        const row = popularSubjects.slice(i, i + 2).map(subject => ({
          text: subject,
          callback_data: `hw_subject_${subject}`
        }));
        keyboard.inline_keyboard.push(row);
      }

      keyboard.inline_keyboard.push(
        [{ text: '✍️ Just Ask Question', callback_data: 'homework_ask_direct' }],
        [{ text: '🔙 Back', callback_data: 'homework_main' }]
      );

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

      // Set state for direct question input
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (user) {
        await this.conversationManager.setUserData(chatId, 'awaiting_homework_question', true);
      }
    } catch (error) {
      console.error('Error initiating homework submission:', error);
      await this.bot.sendMessage(chatId, '❌ Error starting homework submission. Please try again.');
    }
  }

  async handleHomeworkQuestion(chatId, question) {
    await this.submitHomeworkQuestion(chatId, question);
  }

  async submitHomeworkQuestion(chatId, question, subject = null) {
    try {
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ User not found. Please start a conversation first.');
        return;
      }

      await this.bot.sendMessage(chatId, '🔄 Processing your homework question...');

      const homework = await this.homeworkAssistant.submitHomework(user.id, {
        question,
        subject
      });

      const processingMessage = `
✅ *Question Submitted Successfully!*

📋 *Question #${homework.id}*
${homework.getSubjectEmoji()} Subject: ${homework.subject}
${homework.getDifficultyEmoji()} Difficulty: ${homework.difficulty_level}

🔄 AI is analyzing your question and preparing a detailed response...

⏱️ Estimated time: ${homework.getEstimatedTime()} seconds

I'll provide you with:
• Detailed explanation
• Step-by-step solution
• Key concepts
• Additional resources
      `;

      const keyboard = {
        inline_keyboard: [
          [{ text: '👀 View Progress', callback_data: `hw_view_${homework.id}` }],
          [{ text: '❓ Ask Another', callback_data: 'homework_ask' }],
          [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
        ]
      };

      await this.bot.sendMessage(chatId, processingMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

      // The processing will continue asynchronously
      // User will be notified when complete
      
    } catch (error) {
      console.error('Error submitting homework question:', error);
      await this.bot.sendMessage(chatId, '❌ Error submitting question. Please try again.');
    }
  }

  async showHomeworkDetails(chatId, homeworkId) {
    try {
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ User not found. Please start a conversation first.');
        return;
      }

      const homework = await HomeworkSession.findOne({
        where: { id: homeworkId, user_id: user.id }
      });

      if (!homework) {
        await this.bot.sendMessage(chatId, '❌ Homework question not found.');
        return;
      }

      const message = this.homeworkAssistant.formatHomeworkForTelegram(homework, true);

      const keyboard = { inline_keyboard: [] };

      if (homework.status === 'completed' && homework.ai_response) {
        keyboard.inline_keyboard.push([
          { text: '⭐ Rate Answer', callback_data: `hw_feedback_${homeworkId}` }
        ]);
      }

      if (homework.status === 'completed') {
        keyboard.inline_keyboard.push([
          { text: '📤 Share to Study Group', callback_data: `hw_share_${homeworkId}` }
        ]);
      }

      keyboard.inline_keyboard.push(
        [{ text: '📖 Back to History', callback_data: 'homework_history' }],
        [{ text: '🏠 Main Menu', callback_data: 'homework_main' }]
      );

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing homework details:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading homework details. Please try again.');
    }
  }

  // === EVENT/DEADLINE UI METHODS ===

  async showEventsMenu(chatId) {
    try {
      const upcomingEvents = await this.eventManager.getUpcomingEvents(chatId, 30);
      const todayEvents = await this.eventManager.getTodayEvents(chatId);
      const stats = await this.eventManager.getUserEventStats(chatId);

      let message = '📅 *Events & Deadlines Dashboard*\n\n';
      
      // Today's events
      if (todayEvents.length > 0) {
        message += '🔥 *TODAY\'S EVENTS*\n';
        for (const event of todayEvents.slice(0, 3)) {
          const countdown = event.getFormattedCountdown();
          message += `${event.getTypeEmoji()} ${event.title} - ${countdown}\n`;
        }
        message += '\n';
      }

      // Quick stats
      message += `📈 *Quick Stats*\n`;
      message += `📝 Total Events: ${stats.totalEvents}\n`;
      message += `⏳ Upcoming: ${stats.upcomingEvents}\n`;
      message += `✅ Completion Rate: ${stats.completionRate}%\n\n`;

      // Next 3 upcoming events
      if (upcomingEvents.length > 0) {
        message += '⏰ *Next Upcoming Events*\n';
        const nextEvents = upcomingEvents.slice(0, 3);
        for (const event of nextEvents) {
          const countdown = event.getFormattedCountdown();
          const urgency = event.getUrgencyLevel();
          const urgencyEmoji = urgency === 'urgent' ? '🔥' : urgency === 'soon' ? '⚡' : '📅';
          message += `${urgencyEmoji} ${event.getTypeEmoji()} ${event.title}\n`;
          message += `   ${countdown} (${event.event_date.toLocaleDateString()})\n`;
        }
      } else {
        message += '📭 No upcoming events found.\n';
      }

      const keyboard = {
        inline_keyboard: [
          [
            { text: '➕ Add Event', callback_data: 'add_event' },
            { text: '📋 All Events', callback_data: 'list_events' }
          ],
          [
            { text: '⏰ Countdowns', callback_data: 'show_countdowns' },
            { text: '🔔 Reminders', callback_data: 'manage_reminders' }
          ],
          [
            { text: '📊 Statistics', callback_data: 'event_stats' },
            { text: '📅 Calendar', callback_data: 'calendar_view' }
          ],
          [
            { text: '🏠 Main Menu', callback_data: 'main_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Error showing events menu:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading events dashboard. Please try again.');
    }
  }

  async showSkillsCoursesMenu(chatId) {
    try {
      // Get user's enrolled courses
      const enrolledCourses = await this.courseService.getUserCourses(chatId, { limit: 3 });
      const courseStats = await this.courseService.getUserCourseStats(chatId);

      let message = '🎓 *Skills & Courses Dashboard*\n\n';
      
      // User progress overview
      message += `📊 *Your Learning Progress*\n`;
      message += `📚 Enrolled Courses: ${courseStats.totalEnrolled}\n`;
      message += `✅ Completed: ${courseStats.completed}\n`;
      message += `⏳ In Progress: ${courseStats.inProgress}\n`;
      message += `⭐ Average Rating: ${courseStats.averageRating ? courseStats.averageRating.toFixed(1) : 'N/A'}\n\n`;

      // Current courses
      if (enrolledCourses.length > 0) {
        message += '📖 *Current Courses*\n';
        for (const enrollment of enrolledCourses) {
          const course = enrollment.Course;
          const progressBar = this.createProgressBar(enrollment.progress_percentage);
          message += `${course.getEmoji()} ${course.title}\n`;
          message += `   ${progressBar} ${enrollment.progress_percentage}%\n`;
          message += `   ${course.platform} • ${course.difficulty_level}\n`;
        }
        message += '\n';
      }

      // Quick actions
      message += '🚀 *Quick Actions*\n';
      message += '• Browse courses by category\n';
      message += '• Search for specific topics\n';
      message += '• Get personalized recommendations\n';
      message += '• Track your learning progress\n';

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🔍 Browse Courses', callback_data: 'browse_courses' },
            { text: '🎯 Recommendations', callback_data: 'course_recommendations' }
          ],
          [
            { text: '📚 My Courses', callback_data: 'my_courses' },
            { text: '🔥 Trending', callback_data: 'trending_courses' }
          ],
          [
            { text: '💡 Webinars', callback_data: 'browse_webinars' },
            { text: '🎪 Skills Assessment', callback_data: 'skills_assessment' }
          ],
          [
            { text: '📊 Progress Report', callback_data: 'learning_progress' },
            { text: '🔔 Learning Reminders', callback_data: 'learning_reminders' }
          ],
          [
            { text: '🏠 Main Menu', callback_data: 'main_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Error showing skills & courses menu:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading skills & courses dashboard. Please try again.');
    }
  }

  createProgressBar(percentage) {
    const filled = Math.floor(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '▒'.repeat(empty);
  }

  async showAddEventForm(chatId) {
    try {
      const message = `➕ *Add New Event/Deadline*

Please provide the following information:

📝 *Event Title* (required)
📅 *Date & Time* (e.g., "Dec 25 2024 10:00 AM" or "tomorrow 2pm")
📋 *Event Type* (exam, assignment, project, presentation, quiz, deadline, meeting, other)
⚠️ *Priority* (low, medium, high, critical)
📚 *Subject* (optional)
📍 *Location* (optional)
📝 *Description* (optional)

*Example:*
Title: Final Math Exam
Date: December 15 2024 9:00 AM
Type: exam
Priority: high
Subject: Mathematics
Location: Room 101
Description: Calculus final exam covering chapters 1-10

Just send me the details in any format and I'll create your event!`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '📝 Quick Add', callback_data: 'quick_add_event' },
            { text: '📋 Guided Form', callback_data: 'guided_add_event' }
          ],
          [
            { text: '🔙 Back to Events', callback_data: 'events_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Error showing add event form:', error);
      await this.bot.sendMessage(chatId, '❌ Error showing event form. Please try again.');
    }
  }

  async showEventCountdowns(chatId) {
    try {
      const upcomingEvents = await this.eventManager.getUpcomingEvents(chatId, 30);
      
      if (upcomingEvents.length === 0) {
        await this.bot.sendMessage(chatId, '📭 No upcoming events found.\n\nUse /addevent to add your first event!');
        return;
      }

      let message = '⏰ *Event Countdowns*\n\n';
      
      // Group events by urgency
      const groupedEvents = {
        today: [],
        tomorrow: [],
        urgent: [], // 2-3 days
        soon: [], // 4-7 days
        upcoming: [] // 8+ days
      };

      for (const event of upcomingEvents) {
        const urgency = event.getUrgencyLevel();
        if (groupedEvents[urgency]) {
          groupedEvents[urgency].push(event);
        }
      }

      // Display by urgency
      if (groupedEvents.today.length > 0) {
        message += '🔥 *TODAY*\n';
        for (const event of groupedEvents.today) {
          message += `${event.getTypeEmoji()} ${event.title} - ${event.getFormattedCountdown()}\n`;
        }
        message += '\n';
      }

      if (groupedEvents.tomorrow.length > 0) {
        message += '⚡ *TOMORROW*\n';
        for (const event of groupedEvents.tomorrow) {
          message += `${event.getTypeEmoji()} ${event.title} - ${event.getFormattedCountdown()}\n`;
        }
        message += '\n';
      }

      if (groupedEvents.urgent.length > 0) {
        message += '🟠 *URGENT (2-3 days)*\n';
        for (const event of groupedEvents.urgent) {
          message += `${event.getTypeEmoji()} ${event.title} - ${event.getFormattedCountdown()}\n`;
        }
        message += '\n';
      }

      if (groupedEvents.soon.length > 0) {
        message += '🟡 *COMING SOON (4-7 days)*\n';
        for (const event of groupedEvents.soon) {
          message += `${event.getTypeEmoji()} ${event.title} - ${event.getFormattedCountdown()}\n`;
        }
        message += '\n';
      }

      if (groupedEvents.upcoming.length > 0) {
        message += '🟢 *UPCOMING (8+ days)*\n';
        for (const event of groupedEvents.upcoming.slice(0, 5)) {
          message += `${event.getTypeEmoji()} ${event.title} - ${event.getFormattedCountdown()}\n`;
        }
        if (groupedEvents.upcoming.length > 5) {
          message += `... and ${groupedEvents.upcoming.length - 5} more\n`;
        }
      }

      const keyboard = {
        inline_keyboard: [
          [
            { text: '📋 All Events', callback_data: 'list_events' },
            { text: '➕ Add Event', callback_data: 'add_event' }
          ],
          [
            { text: '🔔 Set Reminders', callback_data: 'manage_reminders' },
            { text: '📅 Events Menu', callback_data: 'events_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Error showing event countdowns:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading countdowns. Please try again.');
    }
  }

  async showReminderSettings(chatId) {
    try {
      const upcomingEvents = await this.eventManager.getUpcomingEvents(chatId, 60);
      
      let message = '🔔 *Reminder Settings*\n\n';
      message += 'Manage when you receive notifications for your events:\n\n';

      if (upcomingEvents.length > 0) {
        message += '📋 *Your Events with Reminders:*\n';
        for (const event of upcomingEvents.slice(0, 5)) {
          const reminderStatus = event.reminder_enabled ? '🔔 ON' : '🔕 OFF';
          message += `${event.getTypeEmoji()} ${event.title} - ${reminderStatus}\n`;
        }
        
        if (upcomingEvents.length > 5) {
          message += `... and ${upcomingEvents.length - 5} more events\n`;
        }
      } else {
        message += '📭 No upcoming events with reminders.\n';
      }

      const keyboard = {
        inline_keyboard: [
          [
            { text: '⚙️ Configure Reminders', callback_data: 'configure_reminders' },
            { text: '🔔 Enable All', callback_data: 'enable_all_reminders' }
          ],
          [
            { text: '🔕 Disable All', callback_data: 'disable_all_reminders' },
            { text: '📋 Event List', callback_data: 'list_events' }
          ],
          [
            { text: '📅 Events Menu', callback_data: 'events_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Error showing reminder settings:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading reminder settings. Please try again.');
    }
  }

  async initiateEventCreation(chatId, title) {
    try {
      // Store the title and prompt for more details
      await this.conversationManager.setUserData(chatId, 'creating_event', {
        title: title,
        step: 'date'
      });

      const message = `➕ *Creating Event: "${title}"*\n\n📅 When is this event?\n\nYou can use formats like:\n• "December 15 2024 9:00 AM"\n• "tomorrow 2pm"\n• "next Friday 10:30"\n• "12/15/2024 09:00"\n\nJust type the date and time:`;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Error initiating event creation:', error);
      await this.bot.sendMessage(chatId, '❌ Error starting event creation. Please try again.');
    }
  }

  async processEventCreation(chatId, input, step) {
    try {
      const eventData = await this.conversationManager.getUserData(chatId, 'creating_event');
      
      if (!eventData) {
        await this.bot.sendMessage(chatId, '❌ Event creation session expired. Use /addevent to start again.');
        return;
      }

      switch (step) {
        case 'date':
          try {
            const eventDate = this.eventManager.parseNaturalLanguageDate(input);
            eventData.event_date = eventDate;
            eventData.step = 'type';
            
            await this.conversationManager.setUserData(chatId, 'creating_event', eventData);
            
            const typeKeyboard = {
              inline_keyboard: [
                [
                  { text: '📝 Exam', callback_data: 'event_type_exam' },
                  { text: '📋 Assignment', callback_data: 'event_type_assignment' }
                ],
                [
                  { text: '🏗️ Project', callback_data: 'event_type_project' },
                  { text: '🎤 Presentation', callback_data: 'event_type_presentation' }
                ],
                [
                  { text: '❓ Quiz', callback_data: 'event_type_quiz' },
                  { text: '⏰ Deadline', callback_data: 'event_type_deadline' }
                ],
                [
                  { text: '👥 Meeting', callback_data: 'event_type_meeting' },
                  { text: '📅 Other', callback_data: 'event_type_other' }
                ]
              ]
            };

            await this.bot.sendMessage(chatId, 
              `✅ Date set: ${eventDate.toLocaleString()}\n\n📋 What type of event is this?`, 
              { reply_markup: typeKeyboard }
            );
            
          } catch (error) {
            await this.bot.sendMessage(chatId, 
              '❌ Invalid date format. Please try again with formats like:\n• "December 15 2024 9:00 AM"\n• "tomorrow 2pm"\n• "12/15/2024"'
            );
          }
          break;

        case 'complete':
          // Create the event
          const event = await this.eventManager.createEvent(chatId, eventData);
          await this.conversationManager.clearUserData(chatId, 'creating_event');
          
          const confirmMessage = `✅ *Event Created Successfully!*\n\n${this.eventManager.formatEventForTelegram(event)}\n\n🔔 Reminders are enabled by default. Use /reminders to customize.`;
          
          const keyboard = {
            inline_keyboard: [
              [
                { text: '📅 View All Events', callback_data: 'list_events' },
                { text: '➕ Add Another', callback_data: 'add_event' }
              ],
              [
                { text: '🔔 Set Reminders', callback_data: `event_reminders_${event.id}` },
                { text: '📅 Events Menu', callback_data: 'events_menu' }
              ]
            ]
          };
          
          await this.bot.sendMessage(chatId, confirmMessage, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
          });
          break;
      }

    } catch (error) {
      console.error('Error processing event creation:', error);
      await this.conversationManager.clearUserData(chatId, 'creating_event');
      await this.bot.sendMessage(chatId, '❌ Error creating event. Please try again with /addevent.');
    }
  }

  async handleEventTypeSelection(chatId, callbackData) {
    try {
      const eventType = callbackData.replace('event_type_', '');
      const eventData = await this.conversationManager.getUserData(chatId, 'creating_event');
      
      if (!eventData) {
        await this.bot.sendMessage(chatId, '❌ Event creation session expired. Use /addevent to start again.');
        return;
      }

      eventData.event_type = eventType;
      eventData.step = 'priority';
      
      await this.conversationManager.setUserData(chatId, 'creating_event', eventData);
      
      const priorityKeyboard = {
        inline_keyboard: [
          [
            { text: '🔴 Critical', callback_data: 'priority_critical' },
            { text: '🟠 High', callback_data: 'priority_high' }
          ],
          [
            { text: '🟡 Medium', callback_data: 'priority_medium' },
            { text: '🟢 Low', callback_data: 'priority_low' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, 
        `✅ Event type: ${eventType}\n\n⚠️ What's the priority level?`, 
        { reply_markup: priorityKeyboard }
      );

    } catch (error) {
      console.error('Error handling event type selection:', error);
      await this.bot.sendMessage(chatId, '❌ Error setting event type. Please try again.');
    }
  }

  async showAllEvents(chatId) {
    try {
      const events = await this.eventManager.getUserEvents(chatId, { limit: 20 });
      
      if (events.length === 0) {
        await this.bot.sendMessage(chatId, '📭 No events found.\n\nUse /addevent to create your first event!');
        return;
      }

      let message = '📋 *All Your Events*\n\n';
      
      for (const event of events) {
        const countdown = event.getFormattedCountdown();
        const urgency = event.getUrgencyLevel();
        const urgencyEmoji = urgency === 'urgent' ? '🔥' : urgency === 'soon' ? '⚡' : '📅';
        
        message += `${urgencyEmoji} ${event.getTypeEmoji()} *${event.title}*\n`;
        message += `   ${countdown}\n`;
        message += `   ${event.event_date.toLocaleDateString()} at ${event.event_date.toLocaleTimeString()}\n`;
        message += `   ${event.getPriorityEmoji()} ${event.priority} priority\n\n`;
      }

      const keyboard = {
        inline_keyboard: [
          [
            { text: '⏰ Countdowns', callback_data: 'show_countdowns' },
            { text: '➕ Add Event', callback_data: 'add_event' }
          ],
          [
            { text: '📊 Statistics', callback_data: 'event_stats' },
            { text: '📅 Events Menu', callback_data: 'events_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Error showing all events:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading events. Please try again.');
    }
  }

  async showEventStatistics(chatId) {
    try {
      const stats = await this.eventManager.getUserEventStats(chatId);
      
      let message = '📊 *Your Event Statistics*\n\n';
      message += `📝 Total Events: ${stats.totalEvents}\n`;
      message += `✅ Completed: ${stats.completedEvents}\n`;
      message += `⏳ Upcoming: ${stats.upcomingEvents}\n`;
      message += `🎯 Completion Rate: ${stats.completionRate}%\n\n`;

      if (stats.eventsByType && stats.eventsByType.length > 0) {
        message += '📋 *Events by Type:*\n';
        for (const type of stats.eventsByType) {
          const emoji = this.getTypeEmoji(type.event_type);
          message += `${emoji} ${type.event_type}: ${type.count}\n`;
        }
        message += '\n';
      }

      if (stats.eventsByPriority && stats.eventsByPriority.length > 0) {
        message += '⚠️ *Events by Priority:*\n';
        for (const priority of stats.eventsByPriority) {
          const emoji = this.getPriorityEmoji(priority.priority);
          message += `${emoji} ${priority.priority}: ${priority.count}\n`;
        }
        message += '\n';
      }

      if (stats.avgPreparationTime > 0) {
        message += `⏱️ Avg Study Time: ${Math.round(stats.avgPreparationTime)} minutes\n`;
      }

      message += `📅 Period: ${stats.period}`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '📋 All Events', callback_data: 'list_events' },
            { text: '⏰ Countdowns', callback_data: 'show_countdowns' }
          ],
          [
            { text: '📅 Events Menu', callback_data: 'events_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Error showing event statistics:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading statistics. Please try again.');
    }
  }

  async showCalendarView(chatId) {
    try {
      const events = await this.eventManager.getUserEvents(chatId, { limit: 50 });
      const calendar = this.eventManager.generateCalendarView(events);
      
      let message = calendar + '\n\n';
      
      // Show today's and tomorrow's events
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const todayEvents = events.filter(e => 
        e.event_date.toDateString() === today.toDateString()
      );
      
      const tomorrowEvents = events.filter(e => 
        e.event_date.toDateString() === tomorrow.toDateString()
      );

      if (todayEvents.length > 0) {
        message += '*Today\'s Events:*\n';
        for (const event of todayEvents) {
          message += `${event.getTypeEmoji()} ${event.title} (${event.event_date.toLocaleTimeString()})\n`;
        }
        message += '\n';
      }

      if (tomorrowEvents.length > 0) {
        message += '*Tomorrow\'s Events:*\n';
        for (const event of tomorrowEvents) {
          message += `${event.getTypeEmoji()} ${event.title} (${event.event_date.toLocaleTimeString()})\n`;
        }
      }

      const keyboard = {
        inline_keyboard: [
          [
            { text: '◀️ Prev Month', callback_data: 'calendar_prev' },
            { text: '▶️ Next Month', callback_data: 'calendar_next' }
          ],
          [
            { text: '📋 All Events', callback_data: 'list_events' },
            { text: '📅 Events Menu', callback_data: 'events_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Error showing calendar view:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading calendar. Please try again.');
    }
  }

  getTypeEmoji(eventType) {
    const emojiMap = {
      'exam': '📝',
      'assignment': '📋',
      'project': '🏗️',
      'presentation': '🎤',
      'quiz': '❓',
      'deadline': '⏰',
      'meeting': '👥',
      'other': '📅'
    };
    return emojiMap[eventType] || '📅';
  }

  getPriorityEmoji(priority) {
    const emojiMap = {
      'low': '🟢',
      'medium': '🟡',
      'high': '🟠',
      'critical': '🔴'
    };
    return emojiMap[priority] || '⚪';
  }

  async handlePrioritySelection(chatId, callbackData) {
    try {
      const priority = callbackData.replace('priority_', '');
      const eventData = await this.conversationManager.getUserData(chatId, 'creating_event');
      
      if (!eventData) {
        await this.bot.sendMessage(chatId, '❌ Event creation session expired. Use /addevent to start again.');
        return;
      }

      eventData.priority = priority;
      
      // Set defaults and create the event
      eventData.reminder_enabled = true;
      eventData.reminder_intervals = this.eventManager.getDefaultReminderIntervals(eventData.event_type);
      
      await this.processEventCreation(chatId, null, 'complete');

    } catch (error) {
      console.error('Error handling priority selection:', error);
      await this.bot.sendMessage(chatId, '❌ Error setting priority. Please try again.');
    }
  }

  // === STUDY GROUP UI METHODS ===

  async showStudyGroupMenu(chatId) {
    try {
      const user = await this.databaseService.getUserByTelegramId(chatId);
      const userGroups = user ? await this.studyGroupService.getUserStudyGroups(user.id) : [];
      
      const message = `
👥 *Study Group Dashboard*

Connect with fellow students and form collaborative study groups based on shared interests, subjects, and learning goals.

📊 *Your Statistics*
• Joined Groups: ${userGroups.length}
• Created Groups: ${userGroups.filter(g => g.membershipInfo.role === 'creator').length}
• Total Members Met: ${userGroups.reduce((sum, g) => sum + g.current_members, 0)}

🎯 *What would you like to do?*
      `;

      const keyboard = {
        inline_keyboard: [
          [{ text: '🆕 Create New Group', callback_data: 'studygroup_create' }],
          [{ text: '🔍 Find Groups', callback_data: 'studygroup_find' }],
          [{ text: '🎯 Join by Code', callback_data: 'studygroup_join' }],
          [{ text: '📚 My Groups', callback_data: 'studygroup_my' }],
          [{ text: '✨ Suggestions', callback_data: 'studygroup_suggestions' }],
          [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing study group menu:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading study group dashboard. Please try again.');
    }
  }

  async showMyStudyGroups(chatId) {
    try {
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ User not found. Please start a conversation first.');
        return;
      }

      const userGroups = await this.studyGroupService.getUserStudyGroups(user.id);

      if (userGroups.length === 0) {
        const message = `
📚 *My Study Groups*

You haven't joined any study groups yet! 

🌟 *Get Started:*
• Create your first group
• Browse available groups
• Get personalized suggestions

What would you like to do?
        `;

        const keyboard = {
          inline_keyboard: [
            [{ text: '🆕 Create Group', callback_data: 'studygroup_create' }],
            [{ text: '🔍 Find Groups', callback_data: 'studygroup_find' }],
            [{ text: '✨ Get Suggestions', callback_data: 'studygroup_suggestions' }],
            [{ text: '🔙 Back', callback_data: 'studygroup_main' }]
          ]
        };

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
        return;
      }

      let message = `👥 *My Study Groups* (${userGroups.length})\n\n`;
      
      for (const group of userGroups.slice(0, 5)) { // Show first 5 groups
        const roleEmoji = group.membershipInfo.role === 'creator' ? '👑' : 
                         group.membershipInfo.role === 'admin' ? '⭐' : '👤';
        
        const statusEmoji = group.location_type === 'online' ? '💻' : 
                           group.location_type === 'in-person' ? '🏢' : '🔄';

        message += `${statusEmoji} *${this.studyGroupService.escapeMarkdown(group.name)}*\n`;
        message += `📖 ${group.subject} • ${roleEmoji} ${group.membershipInfo.role}\n`;
        message += `👥 ${group.current_members}/${group.max_members} members\n\n`;
      }

      const keyboard = {
        inline_keyboard: []
      };

      // Add group action buttons
      for (const group of userGroups.slice(0, 3)) {
        keyboard.inline_keyboard.push([
          { text: `📖 ${group.name}`, callback_data: `sg_details_${group.id}` }
        ]);
      }

      keyboard.inline_keyboard.push(
        [{ text: '🔄 Refresh', callback_data: 'studygroup_my' }],
        [{ text: '🔙 Back', callback_data: 'studygroup_main' }]
      );

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing user study groups:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading your study groups. Please try again.');
    }
  }

  async showFindGroupsMenu(chatId) {
    try {
      const subjects = this.studyGroupService.getAvailableSubjects();
      
      const message = `
🔍 *Find Study Groups*

Discover study groups that match your interests and learning goals.

📚 *Browse by Subject:*
      `;

      const keyboard = {
        inline_keyboard: []
      };

      // Create subject buttons (3 per row)
      const popularSubjects = subjects.slice(0, 12);
      for (let i = 0; i < popularSubjects.length; i += 3) {
        const row = popularSubjects.slice(i, i + 3).map(subject => ({
          text: subject,
          callback_data: `sg_search_${subject}`
        }));
        keyboard.inline_keyboard.push(row);
      }

      keyboard.inline_keyboard.push(
        [{ text: '🎯 Smart Matching', callback_data: 'studygroup_suggestions' }],
        [{ text: '🔙 Back', callback_data: 'studygroup_main' }]
      );

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing find groups menu:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading find groups menu. Please try again.');
    }
  }

  async showStudyGroupSuggestions(chatId) {
    try {
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ User not found. Please start a conversation first.');
        return;
      }

      await this.bot.sendMessage(chatId, '🔍 Finding perfect study groups for you...');

      const suggestions = await this.studyGroupService.generateGroupSuggestions(user.id);

      if (suggestions.length === 0) {
        const message = `
✨ *Study Group Suggestions*

No matching groups found right now, but that's okay!

🌟 *What you can do:*
• Create your own study group
• Browse all available groups
• Try searching for specific subjects

Would you like to explore other options?
        `;

        const keyboard = {
          inline_keyboard: [
            [{ text: '🆕 Create Group', callback_data: 'studygroup_create' }],
            [{ text: '🔍 Browse All', callback_data: 'studygroup_find' }],
            [{ text: '🔙 Back', callback_data: 'studygroup_main' }]
          ]
        };

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
        return;
      }

      let message = `✨ *Personalized Study Group Suggestions*\n\nBased on your interests, here are some groups you might like:\n\n`;

      const keyboard = { inline_keyboard: [] };

      for (const group of suggestions.slice(0, 5)) {
        message += this.studyGroupService.formatStudyGroupForTelegram(group, false);
        message += '\n';

        keyboard.inline_keyboard.push([
          { text: `👀 View ${group.name}`, callback_data: `sg_details_${group.id}` },
          { text: `⚡ Join Now`, callback_data: `sg_join_${group.id}` }
        ]);
      }

      keyboard.inline_keyboard.push(
        [{ text: '🔄 Get New Suggestions', callback_data: 'studygroup_suggestions' }],
        [{ text: '🔙 Back', callback_data: 'studygroup_main' }]
      );

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing study group suggestions:', error);
      await this.bot.sendMessage(chatId, '❌ Error generating suggestions. Please try again.');
    }
  }

  async initiateGroupCreation(chatId) {
    try {
      const message = `
🆕 *Create Study Group*

Let's create an amazing study group! I'll guide you through the process.

📝 *Step 1: Basic Information*

What would you like to name your study group?

💡 *Tips for a great name:*
• Be descriptive (e.g., "Advanced Physics Study")
• Include the subject or topic
• Keep it under 50 characters
• Make it welcoming and inclusive

Send me your group name:
      `;

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: { force_reply: true }
      });

      // Store creation state
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (user) {
        await this.conversationManager.setUserData(chatId, 'creating_study_group', true);
        await this.conversationManager.setUserData(chatId, 'group_creation_step', 'name');
      }
    } catch (error) {
      console.error('Error initiating group creation:', error);
      await this.bot.sendMessage(chatId, '❌ Error starting group creation. Please try again.');
    }
  }

  async showJoinGroupOptions(chatId) {
    try {
      const message = `
🎯 *Join Study Group*

There are several ways to join a study group:

🔑 *Have a join code?*
Send me the code and I'll help you join instantly!

🔍 *Don't have a code?*
Browse available groups or get personalized suggestions.

💡 *Join codes look like:* ABC12345

What would you like to do?
      `;

      const keyboard = {
        inline_keyboard: [
          [{ text: '🔑 Enter Join Code', callback_data: 'studygroup_join_code' }],
          [{ text: '🔍 Browse Groups', callback_data: 'studygroup_find' }],
          [{ text: '✨ Get Suggestions', callback_data: 'studygroup_suggestions' }],
          [{ text: '🔙 Back', callback_data: 'studygroup_main' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing join group options:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading join options. Please try again.');
    }
  }

  async searchStudyGroupsBySubject(chatId, subject) {
    try {
      await this.bot.sendMessage(chatId, `🔍 Searching for ${subject} study groups...`);

      const groups = await this.studyGroupService.searchStudyGroups('', { subject });

      if (groups.length === 0) {
        const message = `
📚 *${subject} Study Groups*

No active study groups found for ${subject} right now.

🌟 *What you can do:*
• Create the first ${subject} study group
• Try searching for related subjects
• Get general study group suggestions

Would you like to create a ${subject} study group?
        `;

        const keyboard = {
          inline_keyboard: [
            [{ text: `🆕 Create ${subject} Group`, callback_data: 'studygroup_create' }],
            [{ text: '🔍 Try Other Subjects', callback_data: 'studygroup_find' }],
            [{ text: '🔙 Back', callback_data: 'studygroup_main' }]
          ]
        };

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
        return;
      }

      let message = `📚 *${subject} Study Groups* (${groups.length} found)\n\n`;

      const keyboard = { inline_keyboard: [] };

      for (const group of groups.slice(0, 5)) {
        message += this.studyGroupService.formatStudyGroupForTelegram(group, false);
        message += '\n';

        keyboard.inline_keyboard.push([
          { text: `👀 View ${group.name}`, callback_data: `sg_details_${group.id}` },
          { text: `⚡ Join`, callback_data: `sg_join_${group.id}` }
        ]);
      }

      keyboard.inline_keyboard.push(
        [{ text: '🔍 Search Other Subjects', callback_data: 'studygroup_find' }],
        [{ text: '🔙 Back', callback_data: 'studygroup_main' }]
      );

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error searching study groups by subject:', error);
      await this.bot.sendMessage(chatId, '❌ Error searching for study groups. Please try again.');
    }
  }

  async showStudyGroupDetails(chatId, groupId) {
    try {
      const user = await this.databaseService.getUserByTelegramId(chatId);
      const groupDetails = await this.studyGroupService.getStudyGroupDetails(groupId, user?.id);

      const message = this.studyGroupService.formatStudyGroupForTelegram(groupDetails, true);

      const keyboard = { inline_keyboard: [] };

      if (groupDetails.userMembership) {
        // User is already a member
        keyboard.inline_keyboard.push(
          [{ text: '👥 View Members', callback_data: `sg_members_${groupId}` }],
          [{ text: '🚪 Leave Group', callback_data: `sg_leave_${groupId}` }]
        );
      } else if (groupDetails.canJoin) {
        // User can join
        keyboard.inline_keyboard.push([
          { text: '⚡ Join This Group', callback_data: `sg_join_${groupId}` }
        ]);
      } else if (groupDetails.isFull && groupDetails.isFull()) {
        // Group is full
        keyboard.inline_keyboard.push([
          { text: '❌ Group is Full', callback_data: 'studygroup_find' }
        ]);
      }

      keyboard.inline_keyboard.push([
        { text: '🔙 Back', callback_data: 'studygroup_main' }
      ]);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing study group details:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading group details. Please try again.');
    }
  }

  async joinStudyGroup(chatId, groupId) {
    try {
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ User not found. Please start a conversation first.');
        return;
      }

      await this.bot.sendMessage(chatId, '🔄 Joining study group...');

      const membership = await this.studyGroupService.joinStudyGroup(user.id, groupId);
      const groupDetails = await this.studyGroupService.getStudyGroupDetails(groupId);

      const message = `
🎉 *Welcome to ${groupDetails.name}!*

You've successfully joined the study group.

📚 *Group Info:*
• Subject: ${groupDetails.subject}
• Members: ${groupDetails.current_members}/${groupDetails.max_members}
• Join Code: \`${groupDetails.join_code}\`

🎯 *Next Steps:*
• Introduce yourself to the group
• Check the study schedule
• Participate in discussions

Good luck with your studies!
      `;

      const keyboard = {
        inline_keyboard: [
          [{ text: '👥 View Members', callback_data: `sg_members_${groupId}` }],
          [{ text: '📚 My Groups', callback_data: 'studygroup_my' }],
          [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error joining study group:', error);
      await this.bot.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async leaveStudyGroup(chatId, groupId) {
    try {
      const user = await this.databaseService.getUserByTelegramId(chatId);
      if (!user) {
        await this.bot.sendMessage(chatId, '❌ User not found. Please start a conversation first.');
        return;
      }

      // Show confirmation
      const groupDetails = await this.studyGroupService.getStudyGroupDetails(groupId);
      
      const message = `
🚪 *Leave Study Group*

Are you sure you want to leave "${groupDetails.name}"?

⚠️ *Note:* You'll need a join code or invitation to rejoin later.
      `;

      const keyboard = {
        inline_keyboard: [
          [{ text: '✅ Yes, Leave Group', callback_data: `sg_confirm_leave_${groupId}` }],
          [{ text: '❌ Cancel', callback_data: `sg_details_${groupId}` }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing leave confirmation:', error);
      await this.bot.sendMessage(chatId, '❌ Error processing request. Please try again.');
    }
  }

  async sendWelcomeMessage(chatId) {
    const welcomeMessage = `
🔮 *Welcome to MidDexBot - Your AI Assistant!*

Professional document processing & intelligent study assistance:

💎 *Career Services*
• CV improvement and optimization
• ATS score analysis and enhancement
• Professional cover letter generation
• Career-level assessment

🧠 *Study & Research*
• Instant research assistant
• Smart notes document creator
• Homework helper with step-by-step solutions
• Study planner and timer

🌟 *Document Intelligence*
• Advanced text extraction and analysis
• Smart document categorization
• Key insights and recommendations
• Professional PDF generation

✨ *Quick Commands*
• /research [topic] - Instant research
• /notes [content] - Create smart notes
• /homework [problem] - Get homework help
• /study - Create study plan
• /timer [minutes] - Start study timer

Send documents, ask questions, or use commands to get started!
    `;
    
    await this.bot.sendMessage(chatId, welcomeMessage, { 
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          ['💎 CV Tools', '🧠 Study Assistant'],
          ['🔍 Research', '📝 Smart Notes'],
          ['📚 Homework Help', '⏰ Study Timer'],
          ['📅 Events & Deadlines', '🎓 Skills & Courses'],
          ['🔮 Analyze Document', '✨ Help']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
  }

  // === MAIN MENU SYSTEM ===

  getMainMenuKeyboard() {
    return {
      keyboard: [
        ['💎 CV Tools', '🧠 Study Assistant'],
        ['🔍 Research', '📝 Smart Notes'],
        ['📚 Homework Help', '⏰ Study Timer'],
        ['📅 Events & Deadlines', '🎓 Skills & Courses'],
        ['💰 Crypto Dashboard', '👥 Study Groups'],
        ['🍽️ Food Ordering', '🏪 Restaurant Hub'],
        ['🔮 Analyze Document', '✨ Help & Commands']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    };
  }

  async showMainMenu(chatId) {
    const user = await this.databaseService.getUserByTelegramId(chatId);
    const firstName = user ? user.first_name : 'there';
    
    let message = `🏠 *Main Menu*\n\n`;
    message += `Hello ${firstName}! 👋\n\n`;
    message += `🤖 *Your AI Study & Document Assistant*\n\n`;
    message += `Choose from the options below or use any command:\n\n`;
    message += `📚 **Academic Tools**\n`;
    message += `• Study Assistant & Smart Notes\n`;
    message += `• Homework Help & Timer\n`;
    message += `• Events & Course Management\n\n`;
    message += `💼 **Professional Tools**\n`;
    message += `• CV Analysis & Improvement\n`;
    message += `• Document Analysis\n`;
    message += `• Research Assistant\n\n`;
    message += `💰 **Trading & Finance**\n`;
    message += `• Crypto Dashboard & Alerts\n`;
    message += `• Portfolio Tracking\n\n`;
    message += `👥 **Collaboration**\n`;
    message += `• Study Groups & Communities\n\n`;
    message += `🍽️ **Food Delivery**\n`;
    message += `• Order from nearby restaurants\n`;
    message += `• Register your restaurant\n`;
    message += `• Track orders in real-time\n\n`;
    message += `Type /help to see all available commands!`;

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: this.getMainMenuKeyboard()
    });
  }

  async showHelpMenu(chatId) {
    let message = `🔧 *MidDexBot Commands*\n\n`;
    message += `💎 *Career Commands*\n`;
    message += `/analyze - Analyze uploaded documents\n`;
    message += `/improve - Enhance CV/Resume\n`;
    message += `/cover - Generate cover letter\n`;
    message += `/score - Get ATS compatibility score\n\n`;
    message += `💰 *Crypto Commands*\n`;
    message += `/crypto [coin] - Get crypto prices & info\n`;
    message += `/cryptonews - Latest crypto news\n`;
    message += `/cryptoalert - Set price alerts\n`;
    message += `/watchlist - Manage crypto watchlist\n`;
    message += `/inventory - View portfolio & positions\n`;
    message += `/buy [coin] - Add buy transaction\n`;
    message += `/sell [coin] - Add sell transaction\n\n`;
    message += `🧠 *Study Commands*\n`;
    message += `/research [topic] - Instant research assistant\n`;
    message += `/notes [content] - Create smart notes\n`;
    message += `/homework [problem] - Get homework help\n`;
    message += `/study - Create personalized study plan\n`;
    message += `/timer [minutes] - Start study timer\n\n`;
    message += `👥 *Study Group Commands*\n`;
    message += `/studygroup - Study group dashboard\n`;
    message += `/creategroup - Create new study group\n`;
    message += `/joingroup [code] - Join study group by code\n`;
    message += `/findgroups [topic] - Find matching groups\n`;
    message += `/mygroups - View your study groups\n\n`;
    message += `📚 *Homework Helper Commands*\n`;
    message += `/homework [question] - Submit homework question\n`;
    message += `/askhw [question] - Ask homework question\n`;
    message += `/hwhelp - Homework helper guide\n`;
    message += `/myhomework - View homework history\n\n`;
    message += `📅 *Event & Deadline Commands*\n`;
    message += `/addevent [title] - Add new event or exam\n`;
    message += `/events - View your upcoming events\n`;
    message += `/countdown - Show event countdowns\n`;
    message += `/reminders - Manage reminder settings\n\n`;
    message += `🎓 *Skill Development Commands*\n`;
    message += `/courses - Browse free online courses\n`;
    message += `/webinars - Find educational webinars\n`;
    message += `/skills [topic] - Search skills & training\n`;
    message += `/mycourses - Your learning dashboard\n\n`;
    message += `🍽️ *Food Ordering Commands*\n`;
    message += `/register_restaurant - Register your restaurant\n`;
    message += `/order_food - Order food from nearby restaurants\n`;
    message += `/manage_restaurant - Manage your restaurant\n`;
    message += `/my_orders - View your food orders\n\n`;
    message += `🔧 *System Commands*\n`;
    message += `/debug - View system status and diagnostics\n`;
    message += `/menu - Show main menu\n`;
    message += `/help - Show this help message\n\n`;
    message += `📎 *File Support*\n`;
    message += `• PDF documents, Images, Text files\n`;
    message += `• CV/Resume analysis and improvement\n`;
    message += `• Document text extraction and analysis\n\n`;
    message += `🎯 *Features*\n`;
    message += `• AI-powered research and explanations\n`;
    message += `• Professional document generation\n`;
    message += `• Study planning and time management\n`;
    message += `• Homework assistance with step-by-step solutions\n\n`;
    message += `Just upload files, send text, or use commands!`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🏠 Main Menu', callback_data: 'main_menu' },
          { text: '🔧 System Status', callback_data: 'debug_info' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  // === SKILLS & COURSES METHODS ===

  async showCourseCategoryMenu(chatId) {
    try {
      const categories = await this.courseService.getAvailableCategories();
      
      let message = '📚 *Browse Courses by Category*\n\n';
      message += 'Select a category to explore available courses:\n\n';
      
      categories.forEach(category => {
        message += `• ${category.name} (${category.count} courses)\n`;
      });

      const keyboard = {
        inline_keyboard: []
      };

      // Add category buttons in rows of 2
      for (let i = 0; i < categories.length; i += 2) {
        const row = [];
        row.push({ text: categories[i].name, callback_data: `category_${categories[i].slug}` });
        if (categories[i + 1]) {
          row.push({ text: categories[i + 1].name, callback_data: `category_${categories[i + 1].slug}` });
        }
        keyboard.inline_keyboard.push(row);
      }

      keyboard.inline_keyboard.push([
        { text: '🔍 Search Courses', callback_data: 'course_search' },
        { text: '🏠 Main Menu', callback_data: 'main_menu' }
      ]);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing course categories:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading course categories. Please try again.');
    }
  }

  async showCourseRecommendations(chatId) {
    try {
      const recommendations = await this.courseService.getRecommendedCourses(chatId, { limit: 5 });

      let message = '🎯 *Personalized Course Recommendations*\n\n';
      
      if (recommendations.length === 0) {
        message += '🔍 No personalized recommendations available yet.\n\n';
        message += 'Browse some courses first to get personalized suggestions!';
        
        const keyboard = {
          inline_keyboard: [
            [{ text: '📚 Browse Courses', callback_data: 'browse_courses' }],
            [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
          ]
        };

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
        return;
      }

      message += 'Based on your interests and progress:\n\n';

      const keyboard = { inline_keyboard: [] };

      recommendations.forEach((course, index) => {
        message += `${index + 1}. ${course.getEmoji()} *${course.title}*\n`;
        message += `   ${course.platform} • ${course.difficulty_level} • ${course.getDurationText()}\n`;
        message += `   ⭐ ${course.rating}/5 (${course.rating_count} reviews)\n\n`;

        keyboard.inline_keyboard.push([
          { text: `📖 View "${course.title}"`, callback_data: `course_details_${course.id}` }
        ]);
      });

      keyboard.inline_keyboard.push([
        { text: '🔄 Refresh', callback_data: 'course_recommendations' },
        { text: '🏠 Main Menu', callback_data: 'main_menu' }
      ]);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing course recommendations:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading recommendations. Please try again.');
    }
  }

  async showMyCoursesDashboard(chatId) {
    try {
      const enrolledCourses = await this.courseService.getUserCourses(chatId);
      const stats = await this.courseService.getUserCourseStats(chatId);

      let message = '📚 *My Learning Dashboard*\n\n';
      
      // Stats overview
      message += `📊 *Overview*\n`;
      message += `• Total Enrolled: ${stats.totalEnrolled}\n`;
      message += `• In Progress: ${stats.inProgress}\n`;
      message += `• Completed: ${stats.completed}\n`;
      message += `• Study Time: ${stats.totalStudyTime || 0} hours\n\n`;

      if (enrolledCourses.length === 0) {
        message += '📭 No enrolled courses yet.\n\n';
        message += 'Discover and enroll in courses to start your learning journey!';
        
        const keyboard = {
          inline_keyboard: [
            [{ text: '🔍 Browse Courses', callback_data: 'browse_courses' }],
            [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
          ]
        };

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
        return;
      }

      // Show current courses
      message += `📖 *My Courses*\n`;
      const keyboard = { inline_keyboard: [] };

      enrolledCourses.slice(0, 5).forEach(enrollment => {
        const course = enrollment.Course;
        const progress = enrollment.progress_percentage;
        const progressBar = this.createProgressBar(progress);
        
        message += `${course.getEmoji()} *${course.title}*\n`;
        message += `   ${progressBar} ${progress}%\n`;
        message += `   Status: ${enrollment.status}\n\n`;

        const buttonText = progress > 0 ? `📖 Continue` : `▶️ Start`;
        keyboard.inline_keyboard.push([
          { text: `${buttonText} "${course.title}"`, callback_data: `course_continue_${course.id}` }
        ]);
      });

      keyboard.inline_keyboard.push([
        { text: '📊 Progress Report', callback_data: 'learning_progress' },
        { text: '🎯 Recommendations', callback_data: 'course_recommendations' }
      ]);
      keyboard.inline_keyboard.push([
        { text: '🏠 Main Menu', callback_data: 'main_menu' }
      ]);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing my courses dashboard:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading your courses. Please try again.');
    }
  }

  async showTrendingCourses(chatId) {
    try {
      const trendingCourses = await this.courseService.getTrendingCourses({ limit: 6 });

      let message = '🔥 *Trending Courses*\n\n';
      message += 'Most popular courses this week:\n\n';

      const keyboard = { inline_keyboard: [] };

      trendingCourses.forEach((course, index) => {
        const trendingEmoji = index < 3 ? '🔥' : '📈';
        message += `${trendingEmoji} *${course.title}*\n`;
        message += `   ${course.platform} • ${course.difficulty_level}\n`;
        message += `   ⭐ ${course.rating}/5 • ${course.enrollment_count} enrolled\n\n`;

        keyboard.inline_keyboard.push([
          { text: `📖 View "${course.title}"`, callback_data: `course_details_${course.id}` }
        ]);
      });

      keyboard.inline_keyboard.push([
        { text: '🔄 Refresh', callback_data: 'trending_courses' },
        { text: '🏠 Main Menu', callback_data: 'main_menu' }
      ]);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing trending courses:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading trending courses. Please try again.');
    }
  }

  async showWebinarMenu(chatId) {
    try {
      const upcomingWebinars = await this.courseService.getUpcomingWebinars({ limit: 5 });

      let message = '💡 *Live Webinars & Events*\n\n';
      
      if (upcomingWebinars.length === 0) {
        message += '📭 No upcoming webinars scheduled.\n\n';
        message += 'Check back later for new webinar announcements!';
        
        const keyboard = {
          inline_keyboard: [
            [{ text: '📚 Browse Courses', callback_data: 'browse_courses' }],
            [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
          ]
        };

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
        return;
      }

      message += 'Upcoming live sessions:\n\n';

      const keyboard = { inline_keyboard: [] };

      upcomingWebinars.forEach((webinar, index) => {
        const date = new Date(webinar.scheduled_date);
        message += `🎪 *${webinar.title}*\n`;
        message += `   📅 ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}\n`;
        message += `   👥 ${webinar.registered_count || 0} registered\n`;
        message += `   ⏱️ Duration: ${webinar.duration_minutes} min\n\n`;

        keyboard.inline_keyboard.push([
          { text: `🎪 Register for "${webinar.title}"`, callback_data: `webinar_register_${webinar.id}` }
        ]);
      });

      keyboard.inline_keyboard.push([
        { text: '🔔 Webinar Alerts', callback_data: 'webinar_alerts' },
        { text: '🏠 Main Menu', callback_data: 'main_menu' }
      ]);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing webinar menu:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading webinars. Please try again.');
    }
  }

  async startSkillsAssessment(chatId) {
    try {
      let message = '🎪 *Skills Assessment*\n\n';
      message += 'Take a quick assessment to:\n';
      message += '• Identify your current skill level\n';
      message += '• Get personalized learning paths\n';
      message += '• Discover skill gaps\n';
      message += '• Receive targeted course recommendations\n\n';
      message += '⏱️ Takes about 5-10 minutes\n';

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🚀 Start Assessment', callback_data: 'assessment_start' },
            { text: '📊 View Past Results', callback_data: 'assessment_history' }
          ],
          [
            { text: '🏠 Main Menu', callback_data: 'main_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error starting skills assessment:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading skills assessment. Please try again.');
    }
  }

  async showLearningProgressReport(chatId) {
    try {
      const stats = await this.courseService.getUserCourseStats(chatId);
      const recentActivity = await this.courseService.getRecentActivity(chatId, 7);

      let message = '📊 *Learning Progress Report*\n\n';
      
      // Overall progress
      message += `🎯 *Overall Progress*\n`;
      message += `📚 Courses Enrolled: ${stats.totalEnrolled}\n`;
      message += `✅ Completed: ${stats.completed}\n`;
      message += `⏳ In Progress: ${stats.inProgress}\n`;
      message += `⭐ Average Rating: ${stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}\n`;
      message += `⏱️ Total Study Time: ${stats.totalStudyTime || 0} hours\n\n`;

      // Recent activity
      if (recentActivity && recentActivity.length > 0) {
        message += `📈 *Recent Activity (7 days)*\n`;
        recentActivity.forEach(activity => {
          message += `• ${activity.description}\n`;
        });
        message += '\n';
      }

      // Learning streak
      const streak = await this.courseService.getLearningStreak(chatId);
      message += `🔥 *Learning Streak*\n`;
      message += `Current Streak: ${streak.current} days\n`;
      message += `Longest Streak: ${streak.longest} days\n\n`;

      // Next goals
      const nextGoals = await this.courseService.getUpcomingGoals(chatId);
      if (nextGoals && nextGoals.length > 0) {
        message += `🎯 *Upcoming Goals*\n`;
        nextGoals.forEach(goal => {
          message += `• ${goal.title} (${goal.daysLeft} days left)\n`;
        });
      }

      const keyboard = {
        inline_keyboard: [
          [
            { text: '📚 My Courses', callback_data: 'my_courses' },
            { text: '🎯 Set Goals', callback_data: 'learning_goals' }
          ],
          [
            { text: '📈 Detailed Analytics', callback_data: 'learning_analytics' },
            { text: '🏆 Achievements', callback_data: 'learning_achievements' }
          ],
          [
            { text: '🏠 Main Menu', callback_data: 'main_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing learning progress:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading progress report. Please try again.');
    }
  }

  async manageLearningReminders(chatId) {
    try {
      let message = '🔔 *Learning Reminders*\n\n';
      message += 'Set up reminders to maintain consistent learning habits:\n\n';
      message += '📅 *Daily Study Reminders*\n';
      message += '• Get reminded to study at your preferred time\n';
      message += '• Track your learning streak\n\n';
      message += '📚 *Course Deadlines*\n';
      message += '• Never miss course completion dates\n';
      message += '• Get notified about new course releases\n\n';
      message += '🎪 *Webinar Notifications*\n';
      message += '• Get alerts for upcoming webinars\n';
      message += '• Reminders before live sessions start\n';

      const keyboard = {
        inline_keyboard: [
          [
            { text: '⏰ Set Study Time', callback_data: 'reminder_study_time' },
            { text: '📚 Course Alerts', callback_data: 'reminder_course_alerts' }
          ],
          [
            { text: '🎪 Webinar Alerts', callback_data: 'reminder_webinar_alerts' },
            { text: '📊 Progress Reports', callback_data: 'reminder_progress_reports' }
          ],
          [
            { text: '⚙️ Notification Settings', callback_data: 'notification_settings' },
            { text: '🏠 Main Menu', callback_data: 'main_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error managing learning reminders:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading reminder settings. Please try again.');
    }
  }

  async showCourseDetails(chatId, courseId) {
    try {
      const course = await this.courseService.getCourseById(courseId);
      if (!course) {
        await this.bot.sendMessage(chatId, '❌ Course not found.');
        return;
      }

      let message = `${course.getEmoji()} *${course.title}*\n\n`;
      message += `📖 *Description*\n${course.description}\n\n`;
      message += `🏫 *Platform:* ${course.platform}\n`;
      message += `📊 *Level:* ${course.difficulty_level}\n`;
      message += `⏱️ *Duration:* ${course.getDurationText()}\n`;
      message += `🌐 *Language:* ${course.language}\n`;
      message += `⭐ *Rating:* ${course.rating}/5 (${course.rating_count} reviews)\n`;
      message += `👥 *Enrolled:* ${course.enrollment_count} students\n\n`;

      if (course.tags && course.tags.length > 0) {
        message += `🏷️ *Tags:* ${course.tags.join(', ')}\n\n`;
      }

      if (course.prerequisites && course.prerequisites.length > 0) {
        message += `📋 *Prerequisites:* ${course.prerequisites.join(', ')}\n\n`;
      }

      if (course.course_url) {
        message += `🔗 *Course URL:* ${course.course_url}\n\n`;
      }

      // Check if user is already enrolled
      const isEnrolled = await this.courseService.isUserEnrolled(chatId, courseId);
      
      const keyboard = {
        inline_keyboard: []
      };

      if (isEnrolled) {
        const enrollment = await this.courseService.getUserCourseEnrollment(chatId, courseId);
        const progress = enrollment.progress_percentage;
        message += `📊 *Your Progress:* ${progress}%\n`;
        
        keyboard.inline_keyboard.push([
          { text: '📖 Continue Course', callback_data: `course_continue_${courseId}` }
        ]);
      } else {
        keyboard.inline_keyboard.push([
          { text: '📝 Enroll Now', callback_data: `course_enroll_${courseId}` }
        ]);
      }

      keyboard.inline_keyboard.push([
        { text: '🎯 Similar Courses', callback_data: `course_similar_${courseId}` },
        { text: '💬 Reviews', callback_data: `course_reviews_${courseId}` }
      ]);
      keyboard.inline_keyboard.push([
        { text: '↩️ Back', callback_data: 'browse_courses' },
        { text: '🏠 Main Menu', callback_data: 'main_menu' }
      ]);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing course details:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading course details. Please try again.');
    }
  }

  async enrollInCourse(chatId, courseId) {
    try {
      const result = await this.courseService.enrollUserInCourse(chatId, courseId);
      
      if (result.success) {
        const course = await this.courseService.getCourseById(courseId);
        let message = `🎉 *Successfully Enrolled!*\n\n`;
        message += `You are now enrolled in:\n`;
        message += `${course.getEmoji()} *${course.title}*\n\n`;
        message += `🚀 Ready to start learning?\n`;

        const keyboard = {
          inline_keyboard: [
            [
              { text: '▶️ Start Course', callback_data: `course_continue_${courseId}` }
            ],
            [
              { text: '📚 My Courses', callback_data: 'my_courses' },
              { text: '🎯 More Recommendations', callback_data: 'course_recommendations' }
            ],
            [
              { text: '🏠 Main Menu', callback_data: 'main_menu' }
            ]
          ]
        };

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      } else {
        await this.bot.sendMessage(chatId, `❌ ${result.message || 'Failed to enroll in course.'}`);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      await this.bot.sendMessage(chatId, '❌ Error enrolling in course. Please try again.');
    }
  }

  async continueCourse(chatId, courseId) {
    try {
      const course = await this.courseService.getCourseById(courseId);
      const enrollment = await this.courseService.getUserCourseEnrollment(chatId, courseId);
      
      if (!course || !enrollment) {
        await this.bot.sendMessage(chatId, '❌ Course not found or not enrolled.');
        return;
      }

      let message = `📖 *Continue Learning*\n\n`;
      message += `${course.getEmoji()} *${course.title}*\n\n`;
      message += `📊 *Progress:* ${enrollment.progress_percentage}%\n`;
      const progressBar = this.createProgressBar(enrollment.progress_percentage);
      message += `${progressBar}\n\n`;
      
      if (course.course_url) {
        message += `🔗 *Course Link:* ${course.course_url}\n\n`;
      }

      message += `⏱️ *Study Time:* ${enrollment.study_time_minutes || 0} minutes\n`;
      message += `📅 *Last Activity:* ${enrollment.last_activity_date ? new Date(enrollment.last_activity_date).toLocaleDateString() : 'Never'}\n\n`;

      message += `🎯 *Next Steps:*\n`;
      message += `• Continue from where you left off\n`;
      message += `• Track your progress as you learn\n`;
      message += `• Earn completion certificate\n`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Open Course', url: course.course_url || 'https://example.com' }
          ],
          [
            { text: '✅ Mark Progress', callback_data: `course_progress_${courseId}` },
            { text: '📊 Update Status', callback_data: `course_status_${courseId}` }
          ],
          [
            { text: '📚 My Courses', callback_data: 'my_courses' },
            { text: '🏠 Main Menu', callback_data: 'main_menu' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error continuing course:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading course. Please try again.');
    }
  }

  // ================================
  // FOOD ORDERING METHODS
  // ================================

  async startRestaurantRegistration(chatId) {
    try {
      // Check if user already owns a restaurant
      const existingRestaurant = await FoodOrderService.getRestaurantByOwner(chatId);
      if (existingRestaurant) {
        await this.bot.sendMessage(chatId, '🏪 You already own a restaurant! Use /manage_restaurant to manage it.');
        return;
      }

      let message = `🏪 *Restaurant Registration*\n\n`;
      message += `Welcome to MidDexBot Food Delivery Platform! 🍽️\n\n`;
      message += `Let's get your restaurant registered and start receiving orders.\n\n`;
      message += `📋 *Required Information:*\n`;
      message += `• Restaurant name and description\n`;
      message += `• Complete address with location\n`;
      message += `• Contact phone number\n`;
      message += `• Cuisine type and operating hours\n`;
      message += `• Delivery settings\n\n`;
      message += `⏱️ *Registration takes about 5 minutes*\n\n`;
      message += `Click "Start Registration" to begin:`;

      const keyboard = {
        inline_keyboard: [
          [{ text: '🚀 Start Registration', callback_data: 'start_restaurant_reg' }],
          [{ text: '📚 Registration Guide', callback_data: 'restaurant_guide' }],
          [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error starting restaurant registration:', error);
      await this.bot.sendMessage(chatId, '❌ Error starting registration. Please try again.');
    }
  }

  async startFoodOrdering(chatId) {
    try {
      let message = `🍽️ *Food Ordering*\n\n`;
      message += `Order delicious food from nearby restaurants! 🚀\n\n`;
      message += `📍 *How it works:*\n`;
      message += `1. Share your location or enter address\n`;
      message += `2. Browse nearby restaurants\n`;
      message += `3. Select items and customize\n`;
      message += `4. Confirm order and pay\n`;
      message += `5. Track delivery in real-time\n\n`;
      message += `🎯 *Ready to order?*`;

      const keyboard = {
        inline_keyboard: [
          [{ text: '📍 Share Location', callback_data: 'request_location' }],
          [{ text: '📝 Enter Address', callback_data: 'enter_address' }],
          [{ text: '🍕 Browse All Restaurants', callback_data: 'browse_restaurants' }],
          [{ text: '📦 My Orders', callback_data: 'my_orders' }],
          [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error starting food ordering:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading food ordering. Please try again.');
    }
  }

  async showRestaurantManagement(chatId) {
    try {
      const restaurant = await FoodOrderService.getRestaurantByOwner(chatId);
      
      if (!restaurant) {
        await this.bot.sendMessage(chatId, '🏪 You don\'t own a restaurant yet. Use /register_restaurant to get started!');
        return;
      }

      const analytics = await FoodOrderService.getRestaurantAnalytics(chatId);
      
      let message = `🏪 *Restaurant Management*\n\n`;
      message += `📊 *${restaurant.name}*\n`;
      message += `${restaurant.is_active ? '🟢 Active' : '🔴 Inactive'} • ⭐ ${restaurant.rating}/5.0\n\n`;
      
      message += `📈 *Today's Stats:*\n`;
      message += `• Orders: ${analytics.totalOrders}\n`;
      message += `• Revenue: $${analytics.totalRevenue.toFixed(2)}\n`;
      message += `• Avg Order: $${analytics.averageOrderValue.toFixed(2)}\n\n`;
      
      message += `🍽️ *Menu Items:* ${restaurant.menuItems.length}\n`;
      message += `📦 *Pending Orders:* ${analytics.statusBreakdown.pending || 0}\n`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: restaurant.is_active ? '⏸️ Close Restaurant' : '▶️ Open Restaurant', 
              callback_data: `toggle_restaurant_${restaurant.id}` }
          ],
          [
            { text: '🍽️ Manage Menu', callback_data: `manage_menu_${restaurant.id}` },
            { text: '📦 View Orders', callback_data: `restaurant_orders_${restaurant.id}` }
          ],
          [
            { text: '📊 Analytics', callback_data: `restaurant_analytics_${restaurant.id}` },
            { text: '⚙️ Settings', callback_data: `restaurant_settings_${restaurant.id}` }
          ],
          [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing restaurant management:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading restaurant management. Please try again.');
    }
  }

  async showMyOrders(chatId) {
    try {
      const orders = await FoodOrderService.getOrderHistory(chatId, 5);
      
      if (orders.length === 0) {
        let message = `📦 *My Orders*\n\n`;
        message += `No orders found! 🍽️\n\n`;
        message += `Ready to place your first order?`;

        const keyboard = {
          inline_keyboard: [
            [{ text: '🍕 Order Food', callback_data: 'start_food_ordering' }],
            [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
          ]
        };

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
        return;
      }

      let message = `📦 *My Orders*\n\n`;
      
      orders.forEach((order, index) => {
        const statusEmoji = this.getOrderStatusEmoji(order.status);
        message += `${statusEmoji} *Order #${order.order_number}*\n`;
        message += `🏪 ${order.restaurant.name}\n`;
        message += `💰 $${order.total.toFixed(2)} • ${order.status}\n`;
        message += `📅 ${new Date(order.created_at).toLocaleDateString()}\n\n`;
      });

      const keyboard = {
        inline_keyboard: [
          [{ text: '🔄 Refresh Orders', callback_data: 'refresh_orders' }],
          [{ text: '🍕 Order Again', callback_data: 'start_food_ordering' }],
          [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing my orders:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading orders. Please try again.');
    }
  }

  async showNearbyRestaurants(chatId, latitude, longitude) {
    try {
      const restaurants = await FoodOrderService.getNearbyRestaurants(latitude, longitude);
      
      if (restaurants.length === 0) {
        await this.bot.sendMessage(chatId, '😕 No restaurants found in your area. Try expanding your search radius!');
        return;
      }

      let message = `🏪 *Nearby Restaurants*\n\n`;
      message += `📍 Found ${restaurants.length} restaurants near you:\n\n`;

      const keyboard = {
        inline_keyboard: []
      };

      restaurants.slice(0, 10).forEach(restaurant => {
        const distance = restaurant.getDistance(latitude, longitude);
        const status = restaurant.isOpen() ? '🟢' : '🔴';
        
        message += `${status} *${restaurant.name}*\n`;
        message += `🍽️ ${restaurant.cuisine_type} • ⭐ ${restaurant.rating}/5\n`;
        message += `📍 ${distance.toFixed(1)} km • 🚚 $${restaurant.delivery_fee}\n`;
        message += `⏱️ ${restaurant.average_preparation_time} min\n\n`;

        keyboard.inline_keyboard.push([
          { text: `🍽️ ${restaurant.name}`, callback_data: `restaurant_menu_${restaurant.id}` }
        ]);
      });

      keyboard.inline_keyboard.push([
        { text: '🔄 Refresh', callback_data: 'refresh_restaurants' },
        { text: '🏠 Main Menu', callback_data: 'main_menu' }
      ]);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing nearby restaurants:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading restaurants. Please try again.');
    }
  }

  async showRestaurantMenu(chatId, restaurantId) {
    try {
      const restaurant = await FoodOrderService.getRestaurantDetails(restaurantId);
      
      if (!restaurant) {
        await this.bot.sendMessage(chatId, '❌ Restaurant not found.');
        return;
      }

      let message = `🍽️ *${restaurant.name}*\n\n`;
      message += `${restaurant.isOpen() ? '🟢 Open' : '🔴 Closed'} • ⭐ ${restaurant.rating}/5\n`;
      message += `🍽️ ${restaurant.cuisine_type}\n`;
      message += `🚚 Delivery: $${restaurant.delivery_fee} • Min: $${restaurant.minimum_order_amount}\n`;
      message += `⏱️ Prep time: ${restaurant.average_preparation_time} min\n\n`;

      const menuItems = restaurant.menuItems || [];
      const categories = [...new Set(menuItems.map(item => item.category))];

      if (categories.length === 0) {
        message += `😕 No menu items available at the moment.`;
      } else {
        message += `📋 *Menu Categories:*\n`;
        categories.forEach(category => {
          const items = menuItems.filter(item => item.category === category);
          message += `\n🍽️ *${category}* (${items.length} items)\n`;
          items.slice(0, 3).forEach(item => {
            message += `• ${item.name} - $${item.price.toFixed(2)}\n`;
          });
        });
      }

      const keyboard = {
        inline_keyboard: []
      };

      // Add category buttons
      categories.forEach(category => {
        keyboard.inline_keyboard.push([
          { text: `🍽️ ${category}`, callback_data: `menu_category_${restaurantId}_${category}` }
        ]);
      });

      keyboard.inline_keyboard.push([
        { text: '🛒 View Cart', callback_data: `view_cart_${restaurantId}` },
        { text: '🔙 Back', callback_data: 'browse_restaurants' }
      ]);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing restaurant menu:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading menu. Please try again.');
    }
  }

  getOrderStatusEmoji(status) {
    const statusEmojis = {
      'pending': '⏳',
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'ready': '🎯',
      'out_for_delivery': '🚚',
      'delivered': '📦',
      'cancelled': '❌'
    };
    return statusEmojis[status] || '❓';
  }

  async showRestaurantRegistrationGuide(chatId) {
    let message = `📖 *Restaurant Registration Guide*\n\n`;
    message += `🏪 *Welcome to MidDexBot Food Delivery!*\n\n`;
    message += `📋 *What you'll need:*\n`;
    message += `• Restaurant name and description\n`;
    message += `• Complete address with coordinates\n`;
    message += `• Phone number for orders\n`;
    message += `• Cuisine type (Italian, Chinese, etc.)\n`;
    message += `• Operating hours (Monday-Sunday)\n`;
    message += `• Delivery radius (recommended: 5-10 km)\n`;
    message += `• Delivery fee and minimum order amount\n\n`;
    message += `⚡ *Quick Setup Process:*\n`;
    message += `1. Basic restaurant information\n`;
    message += `2. Location and delivery settings\n`;
    message += `3. Menu items and pricing\n`;
    message += `4. Final review and activation\n\n`;
    message += `💰 *Benefits:*\n`;
    message += `• Reach new customers instantly\n`;
    message += `• Real-time order management\n`;
    message += `• Built-in analytics dashboard\n`;
    message += `• Zero setup fees\n\n`;
    message += `Ready to get started? 🚀`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🚀 Start Registration', callback_data: 'start_restaurant_reg' }],
        [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
      ]
    };

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  async handleRestaurantRegistrationStep(chatId, step) {
    // This would implement a multi-step registration process
    // For now, show a simplified version
    let message = `🏪 *Restaurant Registration*\n\n`;
    message += `Step 1: Basic Information\n\n`;
    message += `Please provide your restaurant details in this format:\n\n`;
    message += `**Restaurant Name:** Your Restaurant Name\n`;
    message += `**Description:** Brief description of your restaurant\n`;
    message += `**Address:** Complete address with street, city, state\n`;
    message += `**Phone:** Contact phone number\n`;
    message += `**Cuisine:** Type of cuisine (e.g., Italian, Chinese, Mexican)\n\n`;
    message += `*Example:*\n`;
    message += `Restaurant Name: Mario's Pizza Palace\n`;
    message += `Description: Authentic Italian pizzas made with fresh ingredients\n`;
    message += `Address: 123 Main St, Downtown, CA 90210\n`;
    message += `Phone: (555) 123-4567\n`;
    message += `Cuisine: Italian\n\n`;
    message += `📝 Please send all information in one message:`;

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });
  }

  async requestUserLocation(chatId) {
    let message = `📍 *Share Your Location*\n\n`;
    message += `To find the best restaurants near you, please share your current location.\n\n`;
    message += `🔒 *Privacy Notice:*\n`;
    message += `Your location is only used to find nearby restaurants and is not stored permanently.\n\n`;
    message += `Use the "Share Location" button below or manually enter your address.`;

    const keyboard = {
      keyboard: [
        [{ text: '📍 Share My Location', request_location: true }]
      ],
      one_time_keyboard: true,
      resize_keyboard: true
    };

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  async handleAddressEntry(chatId) {
    let message = `📝 *Enter Your Address*\n\n`;
    message += `Please type your delivery address:\n\n`;
    message += `*Format:* Street Address, City, State/Province\n\n`;
    message += `*Examples:*\n`;
    message += `• 123 Main Street, New York, NY\n`;
    message += `• 456 Oak Avenue, Los Angeles, CA\n`;
    message += `• 789 Pine Road, Toronto, ON\n\n`;
    message += `📍 We'll use this to find restaurants that deliver to your area.`;

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: { force_reply: true }
    });
  }

  async showAllRestaurants(chatId) {
    try {
      // Get all active restaurants without location filtering
      const { Restaurant } = require('./models');
      const restaurants = await Restaurant.findAll({
        where: { is_active: true, is_verified: true },
        limit: 10,
        order: [['rating', 'DESC']]
      });

      if (restaurants.length === 0) {
        await this.bot.sendMessage(chatId, '😕 No restaurants are currently available. Please try again later!');
        return;
      }

      let message = `🏪 *All Restaurants*\n\n`;
      message += `🍽️ Browse our partner restaurants:\n\n`;

      const keyboard = { inline_keyboard: [] };

      restaurants.forEach(restaurant => {
        const status = restaurant.isOpen() ? '🟢' : '🔴';
        message += `${status} *${restaurant.name}*\n`;
        message += `🍽️ ${restaurant.cuisine_type} • ⭐ ${restaurant.rating}/5\n`;
        message += `🚚 $${restaurant.delivery_fee} • Min: $${restaurant.minimum_order_amount}\n`;
        message += `⏱️ ${restaurant.average_preparation_time} min\n\n`;

        keyboard.inline_keyboard.push([
          { text: `🍽️ ${restaurant.name}`, callback_data: `restaurant_menu_${restaurant.id}` }
        ]);
      });

      keyboard.inline_keyboard.push([
        { text: '📍 Find Near Me', callback_data: 'request_location' },
        { text: '🏠 Main Menu', callback_data: 'main_menu' }
      ]);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing all restaurants:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading restaurants. Please try again.');
    }
  }

  async toggleRestaurantStatus(chatId, restaurantId) {
    try {
      const restaurant = await FoodOrderService.getRestaurantByOwner(chatId);
      if (!restaurant || restaurant.id !== restaurantId) {
        await this.bot.sendMessage(chatId, '❌ Restaurant not found or access denied.');
        return;
      }

      const newStatus = !restaurant.is_active;
      await FoodOrderService.updateRestaurantStatus(chatId, newStatus);

      const statusText = newStatus ? 'opened' : 'closed';
      const emoji = newStatus ? '🟢' : '🔴';
      
      await this.bot.sendMessage(chatId, `${emoji} Restaurant ${statusText} successfully!`);
      await this.showRestaurantManagement(chatId);
    } catch (error) {
      console.error('Error toggling restaurant status:', error);
      await this.bot.sendMessage(chatId, '❌ Error updating restaurant status. Please try again.');
    }
  }

  async showMenuManagement(chatId, restaurantId) {
    try {
      const restaurant = await FoodOrderService.getRestaurantByOwner(chatId);
      if (!restaurant || restaurant.id !== restaurantId) {
        await this.bot.sendMessage(chatId, '❌ Restaurant not found or access denied.');
        return;
      }

      const menuItems = await FoodOrderService.getMenuItems(restaurantId);
      const categories = [...new Set(menuItems.map(item => item.category))];

      let message = `🍽️ *Menu Management*\n\n`;
      message += `📊 *${restaurant.name}*\n`;
      message += `Total Items: ${menuItems.length}\n`;
      message += `Categories: ${categories.length}\n\n`;

      if (categories.length > 0) {
        message += `📋 *Categories:*\n`;
        categories.forEach(category => {
          const items = menuItems.filter(item => item.category === category);
          const available = items.filter(item => item.is_available).length;
          message += `• ${category}: ${available}/${items.length} available\n`;
        });
      }

      const keyboard = {
        inline_keyboard: [
          [{ text: '➕ Add Menu Item', callback_data: `add_menu_item_${restaurantId}` }],
          [{ text: '📝 Edit Menu', callback_data: `edit_menu_${restaurantId}` }],
          [{ text: '🔙 Back to Management', callback_data: 'manage_restaurant' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing menu management:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading menu management. Please try again.');
    }
  }

  async showRestaurantOrders(chatId, restaurantId) {
    try {
      const orders = await FoodOrderService.getRestaurantOrders(chatId);
      
      if (orders.length === 0) {
        await this.bot.sendMessage(chatId, '📦 No orders yet! Your first order will appear here.');
        return;
      }

      let message = `📦 *Restaurant Orders*\n\n`;
      
      const pendingOrders = orders.filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status));
      const recentOrders = orders.slice(0, 10);

      if (pendingOrders.length > 0) {
        message += `⏳ *Active Orders (${pendingOrders.length}):*\n`;
        pendingOrders.forEach(order => {
          const statusEmoji = this.getOrderStatusEmoji(order.status);
          message += `${statusEmoji} #${order.order_number} - $${order.total.toFixed(2)}\n`;
          message += `👤 ${order.customer.first_name} • ${order.status}\n\n`;
        });
      }

      message += `📊 *Recent Orders:*\n`;
      recentOrders.slice(0, 5).forEach(order => {
        const statusEmoji = this.getOrderStatusEmoji(order.status);
        message += `${statusEmoji} #${order.order_number} - $${order.total.toFixed(2)}\n`;
      });

      const keyboard = {
        inline_keyboard: [
          [{ text: '🔄 Refresh Orders', callback_data: `restaurant_orders_${restaurantId}` }],
          [{ text: '📊 Order Analytics', callback_data: `restaurant_analytics_${restaurantId}` }],
          [{ text: '🔙 Back to Management', callback_data: 'manage_restaurant' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing restaurant orders:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading orders. Please try again.');
    }
  }

  async showRestaurantAnalytics(chatId, restaurantId) {
    try {
      const analytics = await FoodOrderService.getRestaurantAnalytics(chatId, 7);
      
      let message = `📊 *Restaurant Analytics*\n\n`;
      message += `📈 *Last 7 Days Performance:*\n\n`;
      message += `📦 Total Orders: ${analytics.totalOrders}\n`;
      message += `💰 Total Revenue: $${analytics.totalRevenue.toFixed(2)}\n`;
      message += `📊 Average Order: $${analytics.averageOrderValue.toFixed(2)}\n\n`;

      if (Object.keys(analytics.statusBreakdown).length > 0) {
        message += `📋 *Order Status:*\n`;
        Object.entries(analytics.statusBreakdown).forEach(([status, count]) => {
          const emoji = this.getOrderStatusEmoji(status);
          message += `${emoji} ${status}: ${count}\n`;
        });
        message += `\n`;
      }

      if (Object.keys(analytics.popularItems).length > 0) {
        message += `🔥 *Popular Items:*\n`;
        const sortedItems = Object.entries(analytics.popularItems)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5);
        
        sortedItems.forEach(([item, count]) => {
          message += `• ${item}: ${count} orders\n`;
        });
      }

      const keyboard = {
        inline_keyboard: [
          [{ text: '📊 Extended Analytics', callback_data: `analytics_extended_${restaurantId}` }],
          [{ text: '📈 Sales Report', callback_data: `sales_report_${restaurantId}` }],
          [{ text: '🔙 Back to Management', callback_data: 'manage_restaurant' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing restaurant analytics:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading analytics. Please try again.');
    }
  }

  async showRestaurantSettings(chatId, restaurantId) {
    try {
      const restaurant = await FoodOrderService.getRestaurantByOwner(chatId);
      if (!restaurant) {
        await this.bot.sendMessage(chatId, '❌ Restaurant not found.');
        return;
      }

      let message = `⚙️ *Restaurant Settings*\n\n`;
      message += `🏪 *${restaurant.name}*\n\n`;
      message += `📍 Address: ${restaurant.address}\n`;
      message += `📞 Phone: ${restaurant.phone}\n`;
      message += `🍽️ Cuisine: ${restaurant.cuisine_type}\n`;
      message += `🚚 Delivery Fee: $${restaurant.delivery_fee}\n`;
      message += `💰 Min Order: $${restaurant.minimum_order_amount}\n`;
      message += `📏 Delivery Radius: ${restaurant.delivery_radius} km\n`;
      message += `⏱️ Prep Time: ${restaurant.average_preparation_time} min\n`;

      const keyboard = {
        inline_keyboard: [
          [{ text: '📝 Edit Details', callback_data: `edit_restaurant_${restaurantId}` }],
          [{ text: '💰 Update Pricing', callback_data: `update_pricing_${restaurantId}` }],
          [{ text: '⏰ Operating Hours', callback_data: `edit_hours_${restaurantId}` }],
          [{ text: '🚚 Delivery Settings', callback_data: `delivery_settings_${restaurantId}` }],
          [{ text: '🔙 Back to Management', callback_data: 'manage_restaurant' }]
        ]
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing restaurant settings:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading settings. Please try again.');
    }
  }

  async showMenuCategory(chatId, restaurantId, category) {
    try {
      const restaurant = await FoodOrderService.getRestaurantDetails(restaurantId);
      if (!restaurant) {
        await this.bot.sendMessage(chatId, '❌ Restaurant not found.');
        return;
      }

      const categoryItems = restaurant.menuItems.filter(item => 
        item.category === category && item.is_available
      );

      let message = `🍽️ *${restaurant.name}*\n`;
      message += `📋 *${category}*\n\n`;

      if (categoryItems.length === 0) {
        message += `😕 No items available in this category.`;
      } else {
        categoryItems.forEach(item => {
          message += `🍽️ *${item.name}*\n`;
          message += `💰 $${item.price.toFixed(2)}\n`;
          if (item.description) {
            message += `📝 ${item.description}\n`;
          }
          message += `⏱️ ${item.preparation_time} min\n\n`;
        });
      }

      const keyboard = {
        inline_keyboard: []
      };

      // Add item selection buttons
      categoryItems.forEach(item => {
        keyboard.inline_keyboard.push([
          { text: `➕ ${item.name} - $${item.price.toFixed(2)}`, 
            callback_data: `add_to_cart_${item.id}` }
        ]);
      });

      keyboard.inline_keyboard.push([
        { text: '🛒 View Cart', callback_data: `view_cart_${restaurantId}` },
        { text: '🔙 Back to Menu', callback_data: `restaurant_menu_${restaurantId}` }
      ]);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error showing menu category:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading menu category. Please try again.');
    }
  }

  async showCart(chatId, restaurantId) {
    // This would implement cart functionality
    // For now, show a placeholder
    let message = `🛒 *Shopping Cart*\n\n`;
    message += `Your cart is empty! 🛍️\n\n`;
    message += `Browse the menu and add items to your cart to get started.`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🍽️ Browse Menu', callback_data: `restaurant_menu_${restaurantId}` }],
        [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
      ]
    };

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  async showRestaurantHub(chatId) {
    try {
      const restaurant = await FoodOrderService.getRestaurantByOwner(chatId);
      
      let message = `🏪 *Restaurant Hub*\n\n`;
      
      if (restaurant) {
        // User owns a restaurant
        message += `👋 Welcome back, ${restaurant.name} owner!\n\n`;
        message += `📊 *Quick Stats:*\n`;
        message += `• Status: ${restaurant.is_active ? '🟢 Active' : '🔴 Inactive'}\n`;
        message += `• Rating: ⭐ ${restaurant.rating}/5.0\n`;
        message += `• Cuisine: 🍽️ ${restaurant.cuisine_type}\n\n`;
        message += `Choose an option below:`;

        const keyboard = {
          inline_keyboard: [
            [{ text: '🏪 Manage Restaurant', callback_data: 'manage_restaurant' }],
            [{ text: '📦 View Orders', callback_data: `restaurant_orders_${restaurant.id}` }],
            [{ text: '🍽️ Manage Menu', callback_data: `manage_menu_${restaurant.id}` }],
            [{ text: '📊 Analytics', callback_data: `restaurant_analytics_${restaurant.id}` }],
            [{ text: '🍕 Order Food', callback_data: 'start_food_ordering' }],
            [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
          ]
        };

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      } else {
        // User doesn't own a restaurant
        message += `Welcome to the Restaurant Hub! 🎉\n\n`;
        message += `🍽️ *For Customers:*\n`;
        message += `• Order delicious food from local restaurants\n`;
        message += `• Track your orders in real-time\n`;
        message += `• Rate and review your experience\n\n`;
        message += `🏪 *For Restaurant Owners:*\n`;
        message += `• Register your restaurant for free\n`;
        message += `• Manage orders and menu items\n`;
        message += `• Access detailed analytics\n`;
        message += `• Reach new customers instantly\n\n`;
        message += `What would you like to do?`;

        const keyboard = {
          inline_keyboard: [
            [{ text: '🍕 Order Food', callback_data: 'start_food_ordering' }],
            [{ text: '🏪 Register Restaurant', callback_data: 'start_restaurant_reg' }],
            [{ text: '📦 My Orders', callback_data: 'my_orders' }],
            [{ text: '🏪 Browse Restaurants', callback_data: 'browse_restaurants' }],
            [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
          ]
        };

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      }
    } catch (error) {
      console.error('Error showing restaurant hub:', error);
      await this.bot.sendMessage(chatId, '❌ Error loading restaurant hub. Please try again.');
    }
  }

  async handleLocation(msg) {
    const chatId = msg.chat.id;
    const { latitude, longitude } = msg.location;
    
    try {
      await this.bot.sendMessage(chatId, '📍 Location received! Finding nearby restaurants...');
      
      // Store location temporarily for future use
      await this.conversationManager.setUserData(chatId, 'userLocation', {
        latitude: latitude,
        longitude: longitude,
        timestamp: Date.now()
      });
      
      // Show nearby restaurants
      await this.showNearbyRestaurants(chatId, latitude, longitude);
    } catch (error) {
      console.error('Error handling location:', error);
      await this.bot.sendMessage(chatId, '❌ Error processing location. Please try again.');
    }
  }
}

// Start the bot
if (require.main === module) {
  const bot = new TelegramDocumentBot();
  bot.start();
}

module.exports = TelegramDocumentBot;