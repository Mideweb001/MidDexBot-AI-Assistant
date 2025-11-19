# 🏨 Hotel Booking System - Quick Reference

## 📱 Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/register_hotel` | Register your hotel | Hotel owners start here |
| `/search_hotels [location]` | Search for hotels | `/search_hotels Lagos` |
| `/book_hotel [id]` | Book a hotel room | After viewing hotel details |
| `/my_bookings` | View your bookings | Track all your reservations |
| `/manage_hotel` | Manage your hotels | For hotel owners |
| `/review_hotel [id]` | Submit a review | After checkout |

## 📂 File Locations

```
src/
├── models/
│   ├── Hotel.js           (190 lines) ✅
│   ├── HotelBooking.js    (180 lines) ✅
│   ├── HotelReview.js     (90 lines)  ✅
│   └── index.js           (UPDATED)    ✅
├── services/
│   └── HotelService.js    (520 lines) ✅
└── server.js              (UPDATED)    ✅
```

## 🔑 Key Methods (HotelService)

### Hotel Management
- `registerHotel(userId, hotelData)` - Register new hotel
- `updateHotel(userId, hotelId, data)` - Update hotel
- `getUserHotels(userId)` - Get owner's hotels

### Search & Discovery
- `searchHotels(criteria)` - Local search with filters
- `searchHotelsWithAPI(location, dates, guests)` - API search
- Supports: city, state, price range, star rating, amenities

### Booking Operations
- `createBooking(userId, bookingData)` - Create booking
- `getUserBookings(userId, status)` - Get user bookings
- `getHotelBookings(userId, hotelId)` - Get hotel's bookings
- `updateBookingStatus(bookingId, status)` - Update status
- `cancelBooking(bookingId, userId, reason)` - Cancel booking

### Reviews
- `addReview(userId, hotelId, reviewData)` - Add review
- `updateHotelRating(hotelId)` - Recalculate rating

## 🗃️ Data Structures

### Hotel Data
```javascript
{
  hotel_name: "Grand Plaza Hotel",
  address: "123 Victoria Island",
  city: "Lagos",
  state: "Lagos",
  country: "Nigeria",
  latitude: 6.4281,
  longitude: 3.4219,
  contact_phone: "+234...",
  contact_email: "info@...",
  star_rating: 4,
  amenities: {
    wifi: true,
    pool: true,
    gym: true,
    parking: true,
    breakfast: true,
    restaurant: true
  },
  room_types: [
    {
      type: "Standard Room",
      price: 25000,
      available: 10,
      capacity: 2,
      description: "..."
    }
  ],
  photos: ["file_id_1", "file_id_2"],
  payment_methods: ["cash", "card", "bank_transfer", "mobile_money"]
}
```

### Booking Data
```javascript
{
  hotel_id: 1,
  room_type: "Standard Room",
  check_in_date: "2025-12-25",
  check_out_date: "2025-12-28",
  number_of_guests: 2,
  number_of_rooms: 1,
  guest_name: "John Doe",
  guest_phone: "+234...",
  guest_email: "john@...",
  payment_method: "card",
  special_requests: "Late check-in"
}
```

### Review Data
```javascript
{
  hotel_id: 1,
  booking_id: 123,
  rating: 5,
  cleanliness_rating: 5,
  service_rating: 5,
  location_rating: 4,
  value_rating: 5,
  review_text: "Excellent stay!"
}
```

## 🌍 Nigerian States (Validated)

Abia, Adamawa, Akwa Ibom, Anambra, Bauchi, Bayelsa, Benue, Borno, Cross River, Delta, Ebonyi, Edo, Ekiti, Enugu, FCT, Gombe, Imo, Jigawa, Kaduna, Kano, Katsina, Kebbi, Kogi, Kwara, Lagos, Nasarawa, Niger, Ogun, Ondo, Osun, Oyo, Plateau, Rivers, Sokoto, Taraba, Yobe, Zamfara

## 📊 Status Values

### Hotel Status
- `pending` - Awaiting admin approval
- `approved` - Active and bookable
- `rejected` - Not approved
- `suspended` - Temporarily disabled

### Booking Status
- `pending` - Awaiting confirmation
- `confirmed` - Reservation confirmed
- `checked_in` - Guest arrived
- `checked_out` - Stay completed
- `cancelled` - Booking cancelled
- `no_show` - Guest didn't arrive

### Payment Status
- `pending` - Payment not received
- `partial` - Partial payment made
- `paid` - Fully paid
- `refunded` - Money returned

## 🔧 Environment Variables

```bash
# Required (Already configured)
TELEGRAM_BOT_TOKEN=your_token
DATABASE_URL=postgresql://...

# Optional (Hotel APIs)
RAPIDAPI_KEY=your_key                # Booking.com (500 free/month)
AMADEUS_API_KEY=your_key             # Amadeus API
AMADEUS_API_SECRET=your_secret       # Amadeus Secret
```

## 🚀 Quick Start

1. **Syntax Check** (All Passed ✅)
   ```bash
   node -c src/models/Hotel.js
   node -c src/models/HotelBooking.js
   node -c src/models/HotelReview.js
   node -c src/services/HotelService.js
   node -c src/server.js
   ```

2. **Test Locally**
   ```bash
   npm start
   ```

3. **Test Commands**
   - `/register_hotel` - Register a test hotel
   - `/search_hotels Lagos` - Search
   - `/my_bookings` - View bookings

4. **Deploy**
   ```bash
   git add .
   git commit -m "Add hotel booking system"
   git push origin main
   ```

## 📋 Implementation Checklist

### ✅ Completed
- [x] Hotel model
- [x] HotelBooking model
- [x] HotelReview model
- [x] HotelService business logic
- [x] Database associations
- [x] Bot command registration
- [x] Syntax validation

### 📝 To Complete
- [ ] Add method handlers (see HOTEL-BOOKING-IMPLEMENTATION.md)
- [ ] Add callback handlers
- [ ] Test registration flow
- [ ] Test booking flow
- [ ] Test review flow
- [ ] Deploy to production

## 🐛 Troubleshooting

### Database Not Syncing
```javascript
// In server.js, add after database initialization:
await this.databaseService.sequelize.sync({ alter: true });
```

### Models Not Found
```javascript
// Verify imports in server.js:
const { Hotel, HotelBooking, HotelReview } = require('./models');
```

### API Not Working
- System works without APIs (local hotels only)
- Check if API keys are in `.env`
- View logs for API errors
- Fallback to local search is automatic

## 📊 Database Tables

Three new tables will be created:
1. `hotels` - Hotel properties
2. `hotel_bookings` - Reservations
3. `hotel_reviews` - Guest reviews

Relationships:
- User → Hotels (1:many) - Owner
- User → HotelBookings (1:many) - Guest
- Hotel → HotelBookings (1:many) - Reservations
- Hotel → HotelReviews (1:many) - Feedback
- HotelBooking → HotelReviews (1:1) - Verified stays

## 💡 Tips

1. **Start Simple**: Begin with local hotels, add APIs later
2. **Test Thoroughly**: Use test data before real hotels
3. **Monitor Logs**: Check for errors during registration
4. **Verify States**: Ensure Nigerian states are spelled correctly
5. **Photo Handling**: Use Telegram file IDs for efficiency

## 📞 Support

- **Documentation**: See HOTEL-BOOKING-IMPLEMENTATION.md
- **API Setup**: See HOTEL-API-SETUP.md
- **Full Summary**: See HOTEL-BOOKING-SUMMARY.md
- **Code Examples**: All methods in implementation guide

## 🎯 Success Metrics

Track these to measure success:
- Number of registered hotels
- Number of bookings made
- Average hotel rating
- Booking cancellation rate
- Review submission rate
- User engagement with hotel features

## 🔒 Security Notes

- Hotel approval required before going live
- Verified stays for authentic reviews
- Unique booking references prevent fraud
- Owner verification protects hotel data
- Payment status tracking for accountability

---

**Ready to launch your hotel booking platform! 🏨🚀**

*Quick Reference v1.0 | Last Updated: 2025*
