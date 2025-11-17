# 🚀 Telegram Bot Deployment Guide

Your MidDexBot is ready for deployment! Here are the best deployment options:

## 📋 Pre-Deployment Checklist

1. **Get your Bot Token** from @BotFather on Telegram
2. **Set up API Keys** (optional but recommended):
   - OpenAI API key for AI features
   - YouTube API key for course features
3. **Choose a deployment platform** below

---

## 🎯 Option 1: Railway (Recommended) ⭐

Railway is perfect for Node.js bots with automatic scaling and easy setup.

### Steps:
1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   # or
   curl -fsSL https://railway.app/install.sh | sh
   ```

2. **Deploy your bot:**
   ```bash
   ./deploy-railway.sh
   ```

3. **Set Environment Variables in Railway Dashboard:**
   - `TELEGRAM_BOT_TOKEN=your_bot_token_here`
   - `NODE_ENV=production`
   - `OPENAI_API_KEY=your_openai_key` (optional)
   - `YOUTUBE_API_KEY=your_youtube_key` (optional)

4. **Get your app URL and set webhook:**
   ```bash
   railway domain
   ```
   Then set `WEBHOOK_URL=https://your-app.railway.app` in Railway dashboard

---

## 🎯 Option 2: Render (Free Tier Available)

### Steps:
1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create account
3. Create new "Web Service" from GitHub repo
4. Set these environment variables:
   - `TELEGRAM_BOT_TOKEN=your_bot_token_here`
   - `NODE_ENV=production`
   - `WEBHOOK_URL=https://your-app.onrender.com`

---

## 🎯 Option 3: Heroku

### Steps:
1. Install Heroku CLI
2. ```bash
   heroku create your-bot-name
   heroku config:set TELEGRAM_BOT_TOKEN=your_token_here
   heroku config:set NODE_ENV=production
   heroku config:set WEBHOOK_URL=https://your-bot-name.herokuapp.com
   git push heroku main
   ```

---

## 🎯 Option 4: VPS/Server (Advanced)

For maximum control and performance:

### Requirements:
- Ubuntu/Debian server
- Node.js 18+
- PM2 for process management
- Nginx for reverse proxy (optional)

### Setup:
```bash
# On your server
git clone your-repo
cd telegramBot
npm install
npm install -g pm2

# Set environment variables
echo "TELEGRAM_BOT_TOKEN=your_token" > .env
echo "NODE_ENV=production" >> .env
echo "WEBHOOK_URL=https://your-domain.com" >> .env

# Start with PM2
pm2 start src/server.js --name telegram-bot
pm2 startup
pm2 save
```

---

## 🔧 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | ✅ Yes | Your bot token from @BotFather |
| `NODE_ENV` | ✅ Yes | Set to `production` |
| `WEBHOOK_URL` | ✅ Yes | Your deployed app URL |
| `PORT` | No | Server port (default: 3000) |
| `OPENAI_API_KEY` | No | For AI analysis features |
| `YOUTUBE_API_KEY` | No | For course discovery |

---

## 🧪 Testing Your Deployment

1. **Check health endpoint:** `https://your-app-url/health`
2. **Test bot commands:**
   - `/start` - Should show welcome message
   - `/menu` - Should show main menu
   - `/help` - Should show all commands
   - Upload a document - Should process correctly

---

## 🔍 Troubleshooting

### Bot not responding:
- ✅ Check webhook is set correctly
- ✅ Verify TELEGRAM_BOT_TOKEN is correct
- ✅ Check app logs for errors
- ✅ Ensure WEBHOOK_URL matches your deployed URL

### Database issues:
- ✅ SQLite works automatically on most platforms
- ✅ For high traffic, consider PostgreSQL
- ✅ Check write permissions in deployment environment

### API Features not working:
- ✅ Verify API keys are set correctly
- ✅ Check rate limits on external APIs
- ✅ Monitor logs for API errors

---

## 📊 Monitoring

Your bot includes built-in monitoring:
- Health check: `/health` endpoint
- Real-time logs in deployment platform
- Automatic restart on crashes
- Database operation logging

---

## 🚀 Quick Deploy Commands

Choose your platform and run:

```bash
# Railway (Recommended)
./deploy-railway.sh

# Manual Railway
railway login && railway up

# Render
# (Use web interface at render.com)

# Heroku
heroku create && git push heroku main
```

---

## 💡 Tips for Production

1. **Monitor logs** regularly for errors
2. **Set up alerts** for downtime
3. **Update dependencies** monthly
4. **Backup database** regularly
5. **Test new features** in development first
6. **Monitor API usage** to avoid rate limits

Your bot includes all these features ready for production:
- 🤖 AI Document Processing
- 📚 Study Assistant & Homework Help
- 👥 Study Groups Management  
- 📅 Event & Exam Countdown
- 🎓 Skills & Courses Platform
- 💰 Crypto Price Tracking
- 📊 User Analytics & Progress
- 🔄 Automatic Database Management

**Ready to launch? Choose a platform above and follow the steps!** 🚀