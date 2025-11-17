# 🤖 Telegram AI Document Bot

A powerful Telegram bot with AI-powered document processing capabilities. This bot can analyze PDFs, extract text from images using OCR, and provide intelligent insights about your documents.

## ✨ Features

### 🔥 Core Features
- **📄 PDF Processing**: Extract and analyze text from PDF documents
- **🖼️ Image OCR**: Read text from images using Tesseract.js  
- **📷 Image-to-PDF**: Convert photos to downloadable PDFs
- **🤖 AI Analysis**: Smart document summarization and key point extraction
- **💼 CV/Resume Tools**: ATS scoring, improvements, cover letter generation
- **📚 Study Assistant**: Research, notes creation, homework help, study planning

### 🎯 Professional Tools
- **📊 Document Analysis**: Intelligent document type detection
- **⭐ ATS Scoring**: Resume compatibility analysis  
- **🌟 Content Improvement**: AI-powered text enhancement
- **💎 PDF Generation**: Professional document creation

### 📖 Study & Research Tools  
- **🔍 Instant Research**: AI-powered topic research
- **� Smart Notes**: Convert content to organized study notes
- **📚 Homework Helper**: Subject-specific assistance
- **⏰ Study Timer**: Pomodoro and custom study sessions
- **📋 Study Planning**: Personalized learning schedules

### 🗄️ Data Management
- **💾 Database Storage**: Persistent user data and document history
- **📊 Usage Analytics**: Track processing statistics and study time
- **🧹 Auto Cleanup**: Configurable data retention policies
- **📤 Data Export**: Complete user data export capabilities

### 🚀 Platform Features
- **�💬 Interactive Chat**: Natural conversation flow with inline keyboards
- **🚀 Fast Setup**: Telegram's superior developer experience  
- **☁️ Cloud Ready**: Deploy to Railway, Vercel, or any Node.js platform
- **🔧 Database Tools**: Built-in database management utilities

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Telegram account
- Optional: OpenAI API key for enhanced AI features

### 2. Create Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Save the bot token (looks like: `123456789:ABCdefGhIJKlmNoPQRsTuVwXyZ`)

### 3. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your bot token
TELEGRAM_BOT_TOKEN=your_bot_token_here
OPENAI_API_KEY=your_openai_key_here  # Optional
```

### 4. Install & Run

```bash
# Install dependencies
npm install

# Setup bot configuration
npm run setup

# Start development server
npm run dev

# Or start production server
npm start
```

### 5. Test Your Bot

1. Open Telegram
2. Search for your bot username (from BotFather)
3. Send `/start` command
4. Upload a document to test AI processing!

## 📁 Project Structure

```
telegramBot/
├── src/
│   ├── server.js              # Main bot server
│   └── services/
│       ├── DocumentProcessor.js    # PDF/Image processing
│       ├── AIAnalyzer.js          # AI analysis engine
│       └── ConversationManager.js # Chat management
├── scripts/
│   └── setup-bot.js          # Bot setup utility
├── .env.example              # Environment template
├── package.json              # Dependencies
├── Procfile                  # Deployment config
└── README.md                 # This file
```

## 🎛️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | ✅ | Your bot token from @BotFather |
| `OPENAI_API_KEY` | ❌ | OpenAI API key for enhanced AI analysis |
| `PORT` | ❌ | Server port (default: 3000) |
| `NODE_ENV` | ❌ | Environment (development/production) |

## 🤖 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and setup |
| `/help` | Show available commands |
| `/analyze` | Analyze uploaded documents |
| `/summarize` | Get document summary |
| `/extract` | Extract key information |

## 📎 Supported File Types

- **PDFs**: `.pdf`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **Text**: `.txt`, `.md`, `.csv`

## 🔧 Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start with nodemon (auto-reload)
npm test           # Run tests
npm run setup      # Setup bot configuration
npm run lint       # Run ESLint
```

### VS Code Tasks

- **Start Telegram Bot**: Press `Cmd+Shift+P` → "Tasks: Run Task" → "Start Telegram Bot"

## 🚀 Deployment

### Railway Deployment

1. **Connect Repository**:
   ```bash
   # Push to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Railway**:
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Add environment variables:
     - `TELEGRAM_BOT_TOKEN`
     - `OPENAI_API_KEY` (optional)

3. **Set Webhook (Production)**:
   ```bash
   # Update webhook URL for production
   curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
        -d "url=https://your-railway-app.railway.app/webhook"
   ```

### Other Platforms

- **Vercel**: Deploy with `vercel --prod`
- **Heroku**: Use included `Procfile`
- **Digital Ocean**: Deploy as Node.js app

## 🔍 How It Works

1. **Message Reception**: Bot receives messages via Telegram Bot API
2. **File Processing**: Documents are downloaded and processed locally
3. **AI Analysis**: Text is analyzed using OpenAI or fallback algorithms
4. **Response Generation**: Results sent back with interactive keyboards

## 🛠️ Customization

### Adding New File Types

Edit `src/services/DocumentProcessor.js`:

```javascript
this.supportedTypes = {
  // Add your format
  word: ['.doc', '.docx'],
  // ... existing types
};
```

### Custom AI Analysis

Modify `src/services/AIAnalyzer.js` to add custom analysis logic:

```javascript
async customAnalysis(text, metadata) {
  // Your custom analysis here
  return analysisResult;
}
```

## �️ Database Management

MidDexBot uses SQLite for local development and supports PostgreSQL/MySQL for production.

### Database Setup

The database is automatically initialized on first run. Configuration options:

```bash
# SQLite (default - automatic)
DATABASE_TYPE=sqlite
DATABASE_STORAGE=database.sqlite

# PostgreSQL (production)
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/telegrambot

# MySQL (production)
DATABASE_TYPE=mysql  
DATABASE_URL=mysql://user:password@localhost:3306/telegrambot
```

### Database Tools

Use the built-in database manager for maintenance:

```bash
# View database statistics
node scripts/db-manager.js stats

# Clean up old data (30 days default)
node scripts/db-manager.js cleanup
node scripts/db-manager.js cleanup 60  # 60 days

# Export user data
node scripts/db-manager.js export 123456789

# Reset database (⚠️ DANGEROUS - deletes all data)
node scripts/db-manager.js reset
```

### Data Models

- **Users**: Telegram user profiles and preferences
- **Documents**: Processed PDFs and text documents with AI analysis
- **ProcessedImages**: OCR results and image analysis data  
- **StudySessions**: Research, notes, homework, and study timer data
- **Conversations**: User session data and conversation context

### Backup & Migration

```bash
# Backup SQLite database
cp database.sqlite database_backup_$(date +%Y%m%d).sqlite

# For production: use proper database backup tools
pg_dump telegrambot > backup.sql  # PostgreSQL
mysqldump telegrambot > backup.sql  # MySQL
```

## 🔐 Security

- Bot tokens are stored in environment variables
- Database includes proper indexes and foreign keys
- User sessions are properly managed with timeouts
- Automatic cleanup of old data prevents storage bloat
- No sensitive data is logged in production mode

## 🐛 Troubleshooting

### Bot Not Responding

1. Check your bot token in `.env`
2. Verify bot is not webhooked: 
   ```bash
   curl "https://api.telegram.org/bot${TOKEN}/deleteWebhook"
   ```
3. Check console logs for errors

### File Processing Fails

1. Verify file type is supported
2. Check file size (max 20MB)
3. Ensure dependencies are installed correctly

### OpenAI Errors

1. Verify API key is correct
2. Check OpenAI account credits
3. Bot falls back to rule-based analysis if OpenAI fails

## 📚 API Documentation

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [OpenAI API](https://platform.openai.com/docs)
- [Tesseract.js OCR](https://tesseract.projectnaptha.com/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) - Telegram Bot API wrapper
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [OpenAI](https://openai.com/) - AI analysis capabilities
- [PDF-parse](https://www.npmjs.com/package/pdf-parse) - PDF text extraction

---

## 🎯 Next Steps

1. **Get Bot Token**: Message [@BotFather](https://t.me/botfather) on Telegram
2. **Configure Environment**: Add your bot token to `.env`
3. **Start Development**: Run `npm run dev`
4. **Test Features**: Upload documents and try AI analysis
5. **Deploy**: Push to Railway/Vercel for production

**Your Telegram AI Document Bot is ready to go! 🚀**