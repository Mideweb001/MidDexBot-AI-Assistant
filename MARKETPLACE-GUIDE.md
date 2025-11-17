# Business Marketplace Features

## 📋 Overview

The Business Marketplace is a comprehensive platform that enables:
- **Business Owners**: Register and manage businesses, receive orders, track analytics
- **Customers**: Search local businesses, place orders, track deliveries, leave reviews
- **Geolocation**: Location-based search with distance calculations
- **Reviews & Ratings**: Customer feedback system with business rating updates

---

## 🏢 For Business Owners

### Register Your Business

**Command**: `/register_business`

**Registration Flow** (Multi-step wizard):
1. **Business Name**: Enter your business name
2. **Category**: Select from:
   - Food & Dining
   - Electronics & Tech
   - Services
   - Fashion & Apparel
   - Health & Beauty
   - Home & Garden
   - Automotive
   - Education
   - Entertainment
   - Other

3. **Location**: Provide city and state
4. **Contact Info**: Phone number, email (optional)
5. **Description**: Brief business description
6. **Menu/Products**: List your products/services with prices
7. **Geolocation** (Optional): Share location for map-based discovery

**Example**:
```
/register_business
→ Bot: "Please provide your business name:"
→ You: "Mike's Pizza Shop"
→ Bot: "Select your business category:" [inline buttons]
→ You: [Click "Food & Dining"]
→ ... (continues through all steps)
```

### Manage Your Business

**Command**: `/my_business`

Shows all your registered businesses with:
- Business name and category
- Current rating (⭐)
- Active/Inactive status
- Management options

**Actions**:
- View business details
- Edit information
- Manage menu/products
- View analytics
- Activate/Deactivate

### Receive & Manage Orders

When a customer places an order:
1. **Instant Notification**: Receive order details via bot message
2. **Order Info Includes**:
   - Customer name and phone
   - Items ordered with quantities
   - Total amount and delivery fee
   - Delivery address (if delivery order)
   - Special instructions

3. **Status Updates**: Change order status through bot
   - Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered
   - Or: Reject/Cancel

**View Orders**: `/my_business` → Select business → "View Orders"

### Business Analytics

Track your performance:
- Total orders (last 30 days)
- Completed vs. cancelled orders
- Total revenue
- Average rating
- Total reviews

---

## 🛒 For Customers

### Search for Businesses

**Command**: `/search [keyword]` or just `/search`

**Search Methods**:

1. **Location-Based Search**:
   ```
   /search
   → Bot: "Choose search method"
   → You: [Click "Share Location"]
   → You: [Share your location]
   → Bot: Shows nearby businesses with distances
   ```

2. **Keyword Search**:
   ```
   /search pizza
   → Bot: Shows all businesses matching "pizza"
   ```

3. **Category Browse**:
   ```
   /search
   → Bot: "Choose search method"
   → You: [Click "Browse Categories"]
   → Bot: Shows category buttons
   ```

**Search Results Include**:
- Business name
- Category
- Rating (⭐) and review count
- Location (city, state)
- Distance from you (if location shared)
- Phone number
- Business ID

### Place an Order

**Command**: `/order [business_id]`

**Ordering Flow**:

1. **View Business**: Search and select a business
2. **Browse Menu**: See available products/services with prices
3. **Add to Cart**: Click "➕" buttons to add items
4. **View Cart**: Review your selections
5. **Provide Details**:
   - Delivery type (Pickup or Delivery)
   - Delivery address (if delivery)
   - Phone number
   - Special instructions (optional)
6. **Confirm Order**: Review total and confirm
7. **Receive Confirmation**: Get order number and tracking info

**Example**:
```
/order 123
→ Bot: Shows business info and menu
→ You: [Click "➕ Pepperoni Pizza - $15.99"]
→ You: [Click "➕ Garlic Bread - $4.99"]
→ You: [Click "View Cart"]
→ Bot: "Cart Total: $20.98. Continue?"
→ You: [Click "Complete Order"]
→ Bot: "Choose delivery type:" [Pickup/Delivery]
→ You: [Click "Delivery"]
→ You: "123 Main St, Apt 4B"
→ Bot: "Provide phone number:"
→ You: "555-0123"
→ Bot: "✅ Order ORD-ABC123 placed! Total: $23.98"
```

### Track Your Orders

**Command**: `/my_orders`

Shows all your marketplace orders with:
- Order number
- Order status with emoji (🕐 pending, 👨‍🍳 preparing, 🚚 delivery, 🎉 delivered)
- Total amount
- Order date

**Order Statuses**:
- 🕐 **Pending**: Business hasn't confirmed yet
- ✅ **Confirmed**: Business accepted your order
- 👨‍🍳 **Preparing**: Your order is being prepared
- ✨ **Ready**: Order ready for pickup
- 🚚 **Out for Delivery**: On the way to you
- 🎉 **Delivered**: Order completed
- ❌ **Cancelled**: Order was cancelled
- 🚫 **Rejected**: Business rejected the order

### Leave Reviews

**Command**: `/review` or `/review [order_id]`

**Review Flow**:
1. Shows completed orders eligible for review
2. Select an order
3. Rate 1-5 stars (⭐⭐⭐⭐⭐)
4. Optionally add written review
5. Submit

**Example**:
```
/review
→ Bot: "Select an order to review:"
→ Bot: Lists delivered orders without reviews
→ You: [Click "Review ORD-ABC123"]
→ Bot: "How would you rate this order?"
→ You: [Click "⭐⭐⭐⭐⭐"]
→ Bot: "Add a comment (optional):"
→ You: "Excellent service! Food was hot and delicious."
→ Bot: "✅ Review submitted! Thank you for your feedback."
```

**Important**: 
- Can only review orders with "Delivered" status
- Each order can only be reviewed once
- Reviews update business rating automatically

---

## 🗺️ Geolocation Features

### How It Works

1. **Share Location**: Use Telegram's location sharing
2. **Distance Calculation**: Haversine formula calculates accurate distances
3. **Nearby Search**: Find businesses within specified radius (default 10km)
4. **Delivery Range**: Businesses can set maximum delivery distance

### Using Location

**Option 1: When Searching**
```
/search
→ [Click "Share Location"]
→ [Share current location via Telegram]
→ Bot: Shows businesses sorted by distance
```

**Option 2: Manual Location**
```
/search coffee downtown
→ Bot: Shows coffee shops in downtown area
```

### Location Privacy

- Location data is **only used for search**
- Not stored permanently
- Can search without sharing location (uses city/state instead)

---

## 📱 Command Reference

### Business Owner Commands
| Command | Description |
|---------|-------------|
| `/register_business` | Start business registration wizard |
| `/my_business` | View and manage your businesses |

### Customer Commands
| Command | Description | Example |
|---------|-------------|---------|
| `/search` | Search for businesses | `/search pizza` |
| `/search [keyword]` | Search by keyword | `/search electronics` |
| `/order [id]` | Order from a business | `/order 123` |
| `/my_orders` | View your order history | `/my_orders` |
| `/review` | Review a completed order | `/review 456` |

---

## 💡 Tips & Best Practices

### For Business Owners

1. **Complete Your Profile**:
   - Add clear business description
   - Include accurate contact information
   - Share your location for map visibility
   - Keep menu updated with current prices

2. **Respond Quickly**:
   - Confirm orders promptly
   - Update order status in real-time
   - Communicate delays or issues

3. **Provide Great Service**:
   - Accurate preparation times
   - Quality products/services
   - Good packaging (for food)
   - Professional communication

4. **Manage Ratings**:
   - Higher ratings = more visibility
   - Good service leads to 5-star reviews
   - Address negative feedback professionally

### For Customers

1. **Use Location for Best Results**:
   - Share location to find nearby businesses
   - See accurate distances
   - Get faster delivery

2. **Provide Clear Information**:
   - Complete delivery address
   - Working phone number
   - Clear special instructions

3. **Track Your Orders**:
   - Check `/my_orders` regularly
   - Contact business if there are delays
   - Be available for delivery

4. **Leave Honest Reviews**:
   - Rate after receiving your order
   - Help others make informed choices
   - Provide constructive feedback

---

## 🔧 Technical Details

### Database Models

**Business Model**:
- Business information (name, category, location)
- Contact details (phone, email, website)
- Menu items (JSON array)
- Rating system (average rating, total reviews)
- Geolocation (latitude, longitude)
- Delivery settings
- Status flags

**Order Model**:
- Customer and business references
- Order items (JSON array)
- Order status (ENUM)
- Delivery information
- Payment details
- Timestamps
- Review/rating

### Geolocation Algorithm

Uses Haversine formula to calculate distances:
```javascript
distance = R × c
where:
  R = Earth's radius (6371 km)
  c = 2 × atan2(√a, √(1-a))
  a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
```

### Search Algorithm

1. **Keyword Search**: Fuzzy matching on business name, category, description
2. **Location Search**: Radius-based filtering with distance sorting
3. **Category Filter**: Exact match on category enum
4. **Result Ranking**: By distance (if location) or rating

---

## 🚀 Coming Soon

- [ ] Payment integration (Stripe, PayPal)
- [ ] Business promotions and offers
- [ ] Category subscription system
- [ ] Advanced analytics dashboard
- [ ] Customer loyalty programs
- [ ] Multi-language support
- [ ] Business verification badges
- [ ] Bulk order discounts

---

## 🆘 Support

If you encounter issues:
1. Try `/help` for command reference
2. Use `/debug` to check system status
3. Contact: [Your support contact]

---

## 📊 Example Scenarios

### Scenario 1: Pizza Delivery

**Customer Side**:
```
1. /search pizza
2. [View "Mike's Pizza Shop" - 2.3 km away]
3. /order 123
4. [Add: Large Pepperoni, Garlic Bread, Soda]
5. [Choose: Delivery]
6. [Enter address: 123 Main St]
7. [Confirm order]
8. [Receive: Order ORD-XYZ789 confirmed]
9. [Track status: Preparing → Delivery → Delivered]
10. /review [Give 5 stars]
```

**Business Side**:
```
1. [Receive notification: New order from John]
2. [View order details]
3. [Confirm order]
4. [Update status: Preparing]
5. [Update status: Out for Delivery]
6. [Update status: Delivered]
7. [View analytics: +$25.99 revenue]
```

### Scenario 2: Service Business

**Business Registration**:
```
1. /register_business
2. Name: "Tech Repair Pro"
3. Category: Electronics & Tech
4. City: San Francisco, State: CA
5. Phone: 555-0199
6. Description: "Professional laptop and phone repairs"
7. Services:
   - Screen Replacement - $89.99
   - Battery Replacement - $49.99
   - Virus Removal - $39.99
8. [Share location]
9. [Registration complete]
```

**Customer Ordering**:
```
1. /search tech repair
2. [Find "Tech Repair Pro" - 1.5 km]
3. /order 124
4. [Select: Screen Replacement]
5. [Type: Pickup]
6. [Special instructions: "iPhone 12 Pro cracked screen"]
7. [Confirm]
8. [Wait for shop to confirm]
9. [Visit shop for service]
10. [Leave 5-star review]
```

---

*Last Updated: 2025-11-17*
*Version: 1.0.0*
