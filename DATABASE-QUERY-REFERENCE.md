# 📊 Database Query Reference

**Date**: November 22, 2025  
**Purpose**: Quick reference for querying your populated databases

---

## 🍽️ Restaurant Database Queries

### Restaurant Table Schema
The restaurants table **does NOT have** `city` or `state` columns.  
Location data is stored in the `tags` JSON array: `["city", "state", "cuisine_type"]`

### Correct Fields
```
id, owner_id, name, description, address, latitude, longitude, 
phone, email, cuisine_type, operating_hours, delivery_radius, 
delivery_fee, minimum_order, rating, total_reviews, is_active, 
is_verified, logo_url, cover_image_url, tags, features, 
created_at, updated_at
```

### Basic Queries

**Count all restaurants:**
```bash
sqlite3 database.sqlite "SELECT COUNT(*) FROM restaurants;"
# Result: 3001
```

**View sample restaurants:**
```bash
sqlite3 database.sqlite "SELECT name, cuisine_type, rating, total_reviews, tags FROM restaurants LIMIT 5;"
```

**Find restaurants by location (using tags):**
```bash
# Lagos restaurants
sqlite3 database.sqlite "SELECT name, cuisine_type, rating FROM restaurants WHERE tags LIKE '%Lagos%' LIMIT 10;"

# Abuja restaurants  
sqlite3 database.sqlite "SELECT name, cuisine_type, rating FROM restaurants WHERE tags LIKE '%Abuja%' LIMIT 10;"

# Port Harcourt restaurants
sqlite3 database.sqlite "SELECT name, cuisine_type, rating FROM restaurants WHERE tags LIKE '%Port Harcourt%' LIMIT 10;"
```

**Find by cuisine type:**
```bash
sqlite3 database.sqlite "SELECT name, rating, tags FROM restaurants WHERE cuisine_type='Continental' LIMIT 5;"
sqlite3 database.sqlite "SELECT name, rating, tags FROM restaurants WHERE cuisine_type='Fast Food' LIMIT 5;"
sqlite3 database.sqlite "SELECT name, rating, tags FROM restaurants WHERE cuisine_type='Nigerian' LIMIT 5;"
```

**Top rated restaurants:**
```bash
sqlite3 database.sqlite "SELECT name, cuisine_type, rating, total_reviews FROM restaurants WHERE rating >= 4.5 ORDER BY rating DESC LIMIT 10;"
```

**Restaurants by cuisine type:**
```bash
sqlite3 database.sqlite "SELECT cuisine_type, COUNT(*) as count FROM restaurants GROUP BY cuisine_type ORDER BY count DESC;"
```

**Extract city/state from tags (formatted):**
```bash
sqlite3 database.sqlite "SELECT name, 
  json_extract(tags, '$[0]') as city,
  json_extract(tags, '$[1]') as state,
  rating 
FROM restaurants LIMIT 10;"
```

---

## 🏨 Hotel Database Queries

### Hotel Table Schema
The hotels table **DOES have** `city` and `state` columns.

### Correct Fields
```
id, owner_id, hotel_name, description, address, city, state, 
country, latitude, longitude, contact_phone, contact_email, 
whatsapp_number, star_rating, amenities, room_types, photos, 
check_in_time, check_out_time, cancellation_policy, payment_methods,
rating, total_reviews, is_verified, is_active, status, metadata,
created_at, updated_at
```

### Basic Queries

**Count all hotels:**
```bash
sqlite3 database.sqlite "SELECT COUNT(*) FROM hotels;"
# Result: 1347
```

**View sample hotels:**
```bash
sqlite3 database.sqlite "SELECT hotel_name, city, state, star_rating, rating, total_reviews FROM hotels LIMIT 5;"
```

**Find hotels by location:**
```bash
# Lagos hotels
sqlite3 database.sqlite "SELECT hotel_name, star_rating, rating FROM hotels WHERE city='Lagos' LIMIT 10;"

# Abuja hotels (note: state is 'FCT')
sqlite3 database.sqlite "SELECT hotel_name, star_rating, rating FROM hotels WHERE state='FCT' LIMIT 10;"

# Port Harcourt hotels
sqlite3 database.sqlite "SELECT hotel_name, star_rating, rating FROM hotels WHERE city='Port Harcourt' LIMIT 10;"
```

**Hotels by state:**
```bash
sqlite3 database.sqlite "SELECT hotel_name, city, star_rating, rating FROM hotels WHERE state='Lagos' LIMIT 10;"
```

**Count hotels per state:**
```bash
sqlite3 database.sqlite "SELECT state, COUNT(*) as count FROM hotels GROUP BY state ORDER BY count DESC LIMIT 10;"
```

**Top rated hotels:**
```bash
sqlite3 database.sqlite "SELECT hotel_name, city, star_rating, rating, total_reviews FROM hotels WHERE rating >= 4.0 ORDER BY rating DESC LIMIT 10;"
```

**Hotels by star rating:**
```bash
sqlite3 database.sqlite "SELECT star_rating, COUNT(*) as count FROM hotels GROUP BY star_rating ORDER BY star_rating DESC;"
```

**Verified hotels:**
```bash
sqlite3 database.sqlite "SELECT hotel_name, city, rating FROM hotels WHERE is_verified=1 LIMIT 10;"
```

**Hotels with GPS coordinates:**
```bash
sqlite3 database.sqlite "SELECT COUNT(*) FROM hotels WHERE latitude IS NOT NULL AND longitude IS NOT NULL;"
```

---

## 📍 Location-Based Queries

### Find restaurants near a location
```bash
# Restaurants in Lagos with high ratings
sqlite3 database.sqlite "SELECT name, rating, total_reviews 
FROM restaurants 
WHERE tags LIKE '%Lagos%' AND rating >= 4.0 
ORDER BY rating DESC 
LIMIT 10;"
```

### Find hotels in multiple states
```bash
sqlite3 database.sqlite "SELECT hotel_name, city, state, rating 
FROM hotels 
WHERE state IN ('Lagos', 'FCT', 'Rivers') 
ORDER BY rating DESC 
LIMIT 15;"
```

### Compare coverage across states
```bash
# Count restaurants by location (extracted from tags)
sqlite3 database.sqlite "SELECT 
  json_extract(tags, '$[0]') as city,
  COUNT(*) as count 
FROM restaurants 
GROUP BY city 
ORDER BY count DESC 
LIMIT 10;"

# Count hotels by state
sqlite3 database.sqlite "SELECT state, COUNT(*) as count 
FROM hotels 
GROUP BY state 
ORDER BY count DESC 
LIMIT 10;"
```

---

## 🔍 Advanced Queries

### Restaurants with most reviews
```bash
sqlite3 database.sqlite "SELECT name, 
  json_extract(tags, '$[0]') as city,
  rating, 
  total_reviews 
FROM restaurants 
ORDER BY total_reviews DESC 
LIMIT 10;"
```

### Hotels with complete data
```bash
sqlite3 database.sqlite "SELECT hotel_name, city, state, rating, total_reviews
FROM hotels 
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL 
  AND rating > 0
  AND total_reviews > 0
ORDER BY rating DESC
LIMIT 10;"
```

### Coverage statistics
```bash
# Total venues
sqlite3 database.sqlite "SELECT 
  'Restaurants' as type, COUNT(*) as count FROM restaurants 
UNION ALL 
SELECT 'Hotels' as type, COUNT(*) as count FROM hotels;"

# Venues with GPS
sqlite3 database.sqlite "SELECT 
  'Restaurants with GPS' as type, 
  COUNT(*) as count 
FROM restaurants 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
UNION ALL
SELECT 
  'Hotels with GPS' as type, 
  COUNT(*) as count 
FROM hotels 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;"

# Verified venues
sqlite3 database.sqlite "SELECT 
  'Verified Restaurants' as type, 
  COUNT(*) as count 
FROM restaurants 
WHERE is_verified=1
UNION ALL
SELECT 
  'Verified Hotels' as type, 
  COUNT(*) as count 
FROM hotels 
WHERE is_verified=1;"
```

---

## 🎯 Key Differences Between Tables

| Feature | Restaurants | Hotels |
|---------|-------------|--------|
| **Name Field** | `name` | `hotel_name` |
| **City Column** | ❌ No (in `tags` JSON) | ✅ Yes (`city`) |
| **State Column** | ❌ No (in `tags` JSON) | ✅ Yes (`state`) |
| **Rating Field** | `rating` | `rating` |
| **Phone Field** | `phone` | `contact_phone` |
| **Email Field** | `email` | `contact_email` |
| **Metadata** | `tags`, `features` JSON | `metadata` JSON |

---

## 💡 Pro Tips

### 1. Always check schema first
```bash
sqlite3 database.sqlite ".schema restaurants"
sqlite3 database.sqlite ".schema hotels"
```

### 2. Use JSON extraction for restaurant locations
```bash
json_extract(tags, '$[0]')  # City
json_extract(tags, '$[1]')  # State
json_extract(tags, '$[2]')  # Cuisine type
```

### 3. Filter by location properly
```bash
# ✅ Correct for restaurants (use tags)
WHERE tags LIKE '%Lagos%'

# ✅ Correct for hotels (use city/state columns)
WHERE city='Lagos' OR state='Lagos'
```

### 4. Pretty print JSON in terminal
```bash
sqlite3 database.sqlite "SELECT tags FROM restaurants LIMIT 1;" | python3 -m json.tool
```

### 5. Export data to CSV
```bash
sqlite3 -header -csv database.sqlite "SELECT * FROM restaurants LIMIT 100;" > restaurants.csv
sqlite3 -header -csv database.sqlite "SELECT * FROM hotels LIMIT 100;" > hotels.csv
```

---

## ✅ Quick Verification Queries

Run these to verify your data is correct:

```bash
# Total counts
sqlite3 database.sqlite "SELECT 
  (SELECT COUNT(*) FROM restaurants) as restaurants,
  (SELECT COUNT(*) FROM hotels) as hotels;"

# Sample from each
sqlite3 database.sqlite "SELECT 'RESTAURANT' as type, name as venue, rating 
FROM restaurants LIMIT 3
UNION ALL
SELECT 'HOTEL' as type, hotel_name as venue, rating 
FROM hotels LIMIT 3;"

# GPS coverage
sqlite3 database.sqlite "SELECT 
  'Restaurants' as type,
  ROUND(100.0 * COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) / COUNT(*), 2) as gps_coverage_percent
FROM restaurants
UNION ALL
SELECT 
  'Hotels' as type,
  ROUND(100.0 * COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) / COUNT(*), 2) as gps_coverage_percent
FROM hotels;"
```

---

## 📚 Related Documentation

- **ALL-BUGS-FIXED.md** - Complete status report
- **READY-FOR-TESTING.md** - Testing guide
- **src/models/Restaurant.js** - Restaurant model definition
- **src/models/Hotel.js** - Hotel model definition

---

**Generated**: November 22, 2025  
**Status**: ✅ **REFERENCE GUIDE**  
**Database**: 3,001 restaurants + 1,347 hotels
