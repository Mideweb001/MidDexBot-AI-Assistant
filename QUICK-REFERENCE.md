# 🚀 Quick Reference - Production Bot

## Your Live Bot URLs
```
🌐 Production: https://telegrambot-production-5661.up.railway.app
❤️  Health Check: https://telegrambot-production-5661.up.railway.app/health
🔗 Webhook: https://telegrambot-production-5661.up.railway.app/webhook
```

## Essential Commands

### Check Bot Status
```bash
# Health check
curl https://telegrambot-production-5661.up.railway.app/health

# Telegram webhook status
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo" | jq
```

### View Logs
```bash
railway logs --lines 100        # Last 100 lines
railway logs --follow           # Live logs
```

### Deploy Updates
```bash
# Method 1: Push to GitHub (automatic)
git add .
git commit -m "Your changes"
git push origin main

# Method 2: Direct upload
railway up --detach
```

### Manage Service
```bash
railway status                  # Check status
railway restart                 # Restart bot
railway variables              # View env vars
railway open                   # Open dashboard
```

## Test Your Bot in Telegram

Send these commands to verify everything works:

```
/start      - Initialize
/menu       - Main menu
/crypto     - Crypto dashboard
/study      - Study tools
/homework   - Get homework help
/events     - Manage deadlines
/debug      - System status
```

## Current Status

✅ **Server**: Railway (production)  
✅ **Database**: PostgreSQL (19 tables)  
✅ **Webhook**: Active & verified  
✅ **SSL**: Enabled  
✅ **Mode**: 100% Cloud (no localhost)  

## What Changed?

### Before (Localhost)
- ❌ Bot ran on your computer
- ❌ Stopped when computer sleeps
- ❌ SQLite file-based database
- ❌ Polling (inefficient)
- ❌ No automatic restarts

### Now (Cloud Production)
- ✅ Bot runs 24/7 on Railway
- ✅ Always online
- ✅ PostgreSQL production database
- ✅ Webhook (efficient)
- ✅ Auto-scaling & failover

## Key Files Modified

### Models Fixed
- ✅ All FK references use lowercase table names
- ✅ Changed BIGINT to INTEGER for user_id
- ✅ Added `constraints: false` to associations
- ✅ Removed explicit REFERENCES to avoid Postgres casing issues

### Server Config
- ✅ Webhook normalization
- ✅ Production/development mode detection
- ✅ Webhook verification logging
- ✅ Graceful DB failure handling

## Important Notes

1. **No Local Server Needed**: Your bot runs entirely on Railway
2. **Database Syncs Automatically**: Schema updates on every deploy
3. **Zero Downtime**: Deployments don't interrupt service
4. **Auto-Deploy**: Every GitHub push triggers deployment
5. **Secure**: All secrets in Railway environment variables

## If Something Goes Wrong

### Bot Not Responding
```bash
# 1. Check if service is running
railway logs --lines 50

# 2. Restart if needed
railway restart

# 3. Verify webhook
curl "https://api.telegram.org/bot${TOKEN}/getWebhookInfo"
```

### Database Issues
```bash
# Check connection in logs
railway logs | grep -i database

# Verify DATABASE_URL exists
railway variables | grep DATABASE_URL
```

### Need to Rollback
```bash
# Railway dashboard > Deployments > Click older deployment > Redeploy
```

## Pro Tips

1. **Monitor Health**: Bookmark your health URL
2. **Check Logs Often**: `railway logs` is your friend
3. **Test Locally First**: Run `npm start` locally before deploying
4. **Use Git Commits**: Detailed commits help track changes
5. **Keep Secrets Safe**: Never commit .env files

## Support

- Railway Docs: https://docs.railway.com
- Telegram Bot API: https://core.telegram.org/bots/api
- Your Project: https://railway.app/project/eb4be912-6283-47ee-a25c-0fd0a624a2d4

---

**🎉 Your bot is live and fully cloud-hosted!**

*No localhost dependencies. Always online. Production-ready.*
