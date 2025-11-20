#!/bin/bash

# Database Optimization Script for MidDexBot
# This script adds indexes to improve query performance

echo "🗄️  MidDexBot Database Optimization"
echo "===================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Please run in Railway or set DATABASE_URL environment variable."
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Create SQL file with all indexes
cat > /tmp/optimize_db.sql << 'EOF'
-- MidDexBot Database Optimization
-- Add indexes for better query performance

-- Users table
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active DESC);

-- Hotels table
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotels_state ON hotels(state);
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels(status);
CREATE INDEX IF NOT EXISTS idx_hotels_rating ON hotels(rating DESC);
CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels(base_price);

-- Hotel Bookings
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_user ON hotel_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_hotel ON hotel_bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_status ON hotel_bookings(status);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_dates ON hotel_bookings(check_in_date, check_out_date);

-- Restaurants table
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);

-- Food Orders
CREATE INDEX IF NOT EXISTS idx_food_orders_user ON food_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_restaurant ON food_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON food_orders(status);
CREATE INDEX IF NOT EXISTS idx_food_orders_created ON food_orders(created_at DESC);

-- Businesses table
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating DESC);

-- Orders table
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Crypto Alerts
CREATE INDEX IF NOT EXISTS idx_crypto_alerts_user ON crypto_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_alerts_symbol ON crypto_alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_alerts_active ON crypto_alerts(is_active);

-- Crypto Inventory
CREATE INDEX IF NOT EXISTS idx_crypto_inventory_user ON crypto_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_inventory_symbol ON crypto_inventory(symbol);

-- Study Groups
CREATE INDEX IF NOT EXISTS idx_study_groups_creator ON study_groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_subject ON study_groups(subject);
CREATE INDEX IF NOT EXISTS idx_study_groups_code ON study_groups(invite_code);

-- Study Group Members
CREATE INDEX IF NOT EXISTS idx_study_group_members_group ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user ON study_group_members(user_id);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

-- Homework Sessions
CREATE INDEX IF NOT EXISTS idx_homework_user ON homework_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_homework_status ON homework_sessions(status);
CREATE INDEX IF NOT EXISTS idx_homework_created ON homework_sessions(created_at DESC);

-- Full-text search indexes (PostgreSQL specific)
CREATE INDEX IF NOT EXISTS idx_hotels_name_search ON hotels USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_restaurants_name_search ON restaurants USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_businesses_name_search ON businesses USING gin(to_tsvector('english', name));

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_hotels_city_status ON hotels(city, status);
CREATE INDEX IF NOT EXISTS idx_restaurants_city_status ON restaurants(city, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_food_orders_user_status ON food_orders(user_id, status);

SELECT 'Indexes created successfully!' as status;
EOF

echo "📝 SQL optimization script created"
echo ""
echo "🔄 Applying database optimizations..."
echo ""

# Apply the SQL file
if command -v psql &> /dev/null; then
    psql "$DATABASE_URL" -f /tmp/optimize_db.sql
else
    echo "⚠️  psql not found. Using node to execute..."
    node << 'NODESCRIPT'
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function optimize() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    const sql = fs.readFileSync('/tmp/optimize_db.sql', 'utf8');
    await client.query(sql);
    
    console.log('✅ Database optimized successfully!');
    console.log('');
    console.log('📊 Indexes added:');
    console.log('   - User indexes (3)');
    console.log('   - Hotel indexes (8)');
    console.log('   - Restaurant indexes (3)');
    console.log('   - Order indexes (8)');
    console.log('   - Crypto indexes (4)');
    console.log('   - Study indexes (4)');
    console.log('   - Search indexes (3)');
    console.log('   - Composite indexes (4)');
    console.log('');
    console.log('🚀 Query performance should improve significantly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

optimize();
NODESCRIPT
fi

# Clean up
rm -f /tmp/optimize_db.sql

echo ""
echo "✅ Optimization complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Monitor query performance in Railway"
echo "   2. Run 'railway logs' to check for slow queries"
echo "   3. Consider adding Redis caching for hot data"
echo ""
