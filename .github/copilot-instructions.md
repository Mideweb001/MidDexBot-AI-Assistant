# MidDexBot AI Assistant - Copilot Instructions

MidDexBot is a full-featured Telegram bot offering marketplace, food delivery, hotel booking, crypto trading, study assistance, and career tools. Built with Node.js, Express, Sequelize ORM, and multiple external APIs.

## Architecture Overview

### Core Structure
- **Entry Point**: `src/server.js` - Main bot class `TelegramDocumentBot` with Express server
- **Database**: Sequelize ORM with PostgreSQL (production) / SQLite (development)
- **Models**: `src/models/` - 23+ models with complex associations (User, Document, Restaurant, Hotel, Business, etc.)
- **Services**: `src/services/` - 17+ service classes for business logic
- **UI Layer**: `src/config/InterfaceManager.js` + `ModernUX.js` - Centralized menu/keyboard management

### Service Architecture Pattern
Each major feature has a dedicated service class:
- `DatabaseService` - Sequelize operations wrapper
- `DocumentProcessor` - PDF/image/OCR processing
- `AIAnalyzer` - OpenAI integration with fallback logic
- `HotelService`, `FoodOrderService`, `BusinessService` - Feature-specific CRUD
- `CryptoService` - CoinGecko API integration
- `ConversationManager` - User session/state management

Services are instantiated in `TelegramDocumentBot` constructor and injected where needed.

## Database Patterns

### Model Definitions
All models follow this pattern:
```javascript
module.exports = (sequelize) => {
  const Model = sequelize.define('table_name', {
    // fields with underscored naming
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  });
  return Model;
};
```

### Association Management
Defined in `src/models/index.js` with `constraints: false` to prevent FK issues during sync:
```javascript
User.hasMany(Document, { foreignKey: 'user_id', as: 'documents', constraints: false });
Document.belongsTo(User, { foreignKey: 'user_id', as: 'user', constraints: false });
```

### Database Initialization
- Production: `sequelize.sync({ alter: false })` - Conservative sync to avoid ENUM migration issues
- Development: `sequelize.sync({ alter: true })` - Auto-migrate schema changes
- Always use try/catch around sync operations as warnings are expected in production

## Command Handling Pattern

### Command Registration
Commands are registered using regex patterns in `setupBotHandlers()`:
```javascript
this.bot.onText(/\/command(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const param = match && match[1] ? match[1].trim() : null;
  // Handler logic
});
```

### Callback Query Handling
All inline keyboard callbacks route through `handleCallbackQuery()` with a large switch statement. Use prefixed patterns:
- `menu_*` - Navigation callbacks
- `crypto_*` - Crypto feature callbacks  
- `hotel_*` - Hotel feature callbacks
- `category_*` - Business category callbacks

### User Auto-Registration
Always ensure user exists before operations:
```javascript
const user = await this.databaseService.findOrCreateUser(msg.from);
```

## Development Workflows

### Local Development
```bash
npm run dev     # Starts with nodemon (polling mode)
```
Bot automatically uses polling when `NODE_ENV !== 'production'` or `WEBHOOK_URL` is unset.

### Production Deployment
Scripts in root directory manage Railway deployment:
- `./setup-production.sh` - Automated production setup
- `./verify-production.sh` - Check production configuration
- `railway up` - Manual deployment trigger

Production mode differences:
- Webhook-based updates (no polling)
- PostgreSQL database
- Suppressed verbose logging
- Conservative database syncing

### Database Management
```bash
node scripts/db-manager.js stats      # View statistics
node scripts/db-manager.js cleanup    # Clean old data
node scripts/db-manager.js export ID  # Export user data
```

## Critical Integration Points

### External APIs
1. **OpenAI** - Document analysis with fallback to rule-based analysis if quota exceeded
2. **RapidAPI Hotels** - 28M+ hotels via `booking-com.p.rapidapi.com`
3. **CoinGecko** - Crypto prices (no auth required)
4. **Telegram Bot API** - Via `node-telegram-bot-api` package

### Environment Variables
Required: `TELEGRAM_BOT_TOKEN`  
Optional: `OPENAI_API_KEY`, `RAPIDAPI_KEY`, `WEBHOOK_URL`, `DATABASE_URL`, `NODE_ENV`

### File Processing Flow
1. User uploads document/photo → `handleDocument()` / `handlePhoto()`
2. Download via `bot.getFile(fileId)` 
3. Process via `DocumentProcessor` or OCR
4. Analyze via `AIAnalyzer` (with fallback)
5. Store in database via `DatabaseService`
6. Send results with inline keyboard options

## Code Conventions

### Error Handling
Always wrap async operations with try/catch and send user-friendly error messages:
```javascript
try {
  // operation
} catch (error) {
  console.error('❌ Error description:', error);
  await this.bot.sendMessage(chatId, '❌ User-friendly error message');
}
```

### UI Patterns
Use `InterfaceManager` static methods for consistent menus:
```javascript
const message = InterfaceManager.getMainMenuMessage(firstName);
const keyboard = InterfaceManager.getMainMenuKeyboard();
await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
```

### State Management
Store temporary user data via `ConversationManager`:
```javascript
await this.conversationManager.setUserData(chatId, 'key', value);
const data = await this.conversationManager.getUserData(chatId, 'key');
```

Persistent conversation data via database:
```javascript
await this.databaseService.setConversationData(user.id, { mode: 'buy_transaction', step: 1 });
```

### Logging Standards
- ✅ Success with emoji prefix
- ❌ Errors with emoji prefix
- 🔍 Debug/info with emoji prefix
- Production mode suppresses library-level logs (see `src/server.js` top-level logging overrides)

## Testing & Verification

### Verify Bot Health
```bash
curl https://YOUR-RAILWAY-URL/health
```

### Test Command Flow
1. `/start` - Main menu with user auto-registration
2. Upload document - Triggers document processing pipeline
3. Share location - Triggers restaurant/business search with distance calculation
4. `/crypto bitcoin` - Tests external API integration

### Common Issues
- **"No recent document found"** - User needs to upload first
- **OpenAI quota exceeded** - Fallback analysis activates automatically
- **Webhook not responding** - Check `WEBHOOK_URL` matches Railway domain exactly
- **Database ENUM errors** - Expected in production, tables already exist

## Key Files Reference

- `src/server.js` (8869 lines) - Main bot orchestration
- `src/models/index.js` - All model associations
- `src/services/DatabaseService.js` - Database abstraction layer
- `src/config/InterfaceManager.js` - UI message generation
- `START-HERE.md` - Quick production setup guide
- `CURRENT-STATUS.md` - Deployment status and next steps

Last Updated: 2025-11-21