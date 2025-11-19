# Hotel Booking API Configuration

## Optional External Hotel APIs

The hotel booking system works perfectly with local hotels only. However, you can optionally integrate external APIs to provide access to thousands of hotels worldwide.

### 1. RapidAPI (Booking.com Integration)

**Best for**: African markets, comprehensive hotel data
**Cost**: Free tier available (500 requests/month)

Sign up: https://rapidapi.com/apidojo/api/booking-com/

After subscribing, add to your `.env`:
\`\`\`
RAPIDAPI_KEY=your_rapidapi_key_here
\`\`\`

### 2. Amadeus API

**Best for**: Professional travel industry integration
**Cost**: Free tier available (2000 requests/month)

Sign up: https://developers.amadeus.com/

After creating an app, add to your `.env`:
\`\`\`
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
\`\`\`

### 3. Booking.com Direct API

**Best for**: Large-scale operations
**Cost**: Contact Booking.com for pricing
**Note**: Requires business verification

Sign up: https://developers.booking.com/

After approval, add to your `.env`:
\`\`\`
BOOKING_API_KEY=your_booking_com_key_here
\`\`\`

## Current .env Configuration

Make sure your `.env` file has these base variables:
\`\`\`
# Core Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
DATABASE_URL=your_postgres_url_here
WEBHOOK_URL=your_webhook_url_here
NODE_ENV=production

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_key_here

# Hotel Booking APIs (Optional)
# RAPIDAPI_KEY=
# AMADEUS_API_KEY=
# AMADEUS_API_SECRET=
# BOOKING_API_KEY=
\`\`\`

## How the System Works Without APIs

The HotelService automatically:
1. **Checks if API keys are configured**
2. **Falls back to local search** if no APIs available
3. **Returns local hotel results** from your database
4. **Logs warnings** when API features are unavailable

This means:
- ✅ Your system works immediately with zero API configuration
- ✅ Hotel owners can register their properties
- ✅ Users can search and book local hotels
- ✅ You can add API integrations later as your platform grows

## Geolocation (Always Free)

The system uses **OpenStreetMap Nominatim** for geocoding:
- ✅ Free to use
- ✅ No API key required
- ✅ Converts addresses to coordinates
- ✅ Enables distance calculations

## Recommended Setup Path

### Phase 1: Launch (No APIs Needed)
- Start with local hotel registrations
- Build your database of African hotels
- Test all booking and review features
- Grow your hotel owner network

### Phase 2: Expand (Add RapidAPI)
- Once you have 20+ local hotels
- Add RapidAPI for international hotels
- Merge local and API results
- Provide wider coverage

### Phase 3: Scale (Professional APIs)
- Add Amadeus for travel agency features
- Consider Booking.com partnership
- Implement advanced search filters
- Add price comparison features

## API Usage Tips

1. **Rate Limiting**: All APIs have request limits
   - Cache search results for 1 hour
   - Prioritize local hotels in search results
   - Use APIs only for expanded searches

2. **Cost Management**:
   - Free tiers are usually sufficient for testing
   - Monitor your usage in API dashboards
   - Implement caching to reduce API calls
   - Show local hotels first (they're free!)

3. **Error Handling**:
   - System gracefully handles API failures
   - Falls back to local results automatically
   - Logs errors for debugging
   - Users see seamless experience

## Testing Without APIs

You can fully test the system without any API keys:

\`\`\`bash
# 1. Register a test hotel
/register_hotel

# 2. Search for it
/search_hotels Lagos

# 3. Book a room
/book_hotel 1

# 4. View bookings
/my_bookings

# 5. Leave a review
/review_hotel 1
\`\`\`

All features work perfectly with local data!

## Need Help?

- Check the logs: System will indicate if APIs are unavailable
- Read the code: `src/services/HotelService.js` has detailed comments
- Test locally first: Verify everything works without APIs
- Add APIs gradually: Start with one, then expand

## Quick Reference

| API | Coverage | Cost | Setup Time |
|-----|----------|------|------------|
| Local Only | Nigeria/Africa | Free | 0 minutes |
| RapidAPI | Worldwide | Free tier | 5 minutes |
| Amadeus | Worldwide | Free tier | 10 minutes |
| Booking.com | Worldwide | Paid | Days/weeks |

**Recommendation**: Start with local-only, add RapidAPI when ready.
