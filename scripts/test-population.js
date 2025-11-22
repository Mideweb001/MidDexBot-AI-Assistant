#!/usr/bin/env node

/**
 * Quick Restaurant Population Test
 * 
 * Tests the population script with a small subset of data
 * to verify Google Maps API is working correctly
 */

require('dotenv').config();
const axios = require('axios');
const { sequelize, Restaurant, User } = require('../src/models');

// Test with just Lagos first
const TEST_CITY = { 
  name: 'Lagos', 
  state: 'Lagos', 
  lat: 6.5244, 
  lng: 3.3792, 
  radius: 10000 // Smaller radius for testing
};

// Test with fewer cuisine types
const TEST_CUISINES = ['restaurant', 'nigerian restaurant', 'fast food'];

class QuickPopulationTest {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.systemUser = null;
    this.totalAdded = 0;
  }

  async initialize() {
    console.log('\n🧪 Quick Population Test\n');
    console.log('=' .repeat(60));

    if (!this.apiKey) {
      throw new Error('❌ GOOGLE_MAPS_API_KEY not found in .env file');
    }
    console.log('✅ API Key found:', this.apiKey.substring(0, 20) + '...');

    // Test API key with a simple request
    console.log('\n🔍 Testing Google Places API...');
    try {
      const testUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
      const response = await axios.get(testUrl, {
        params: {
          location: `${TEST_CITY.lat},${TEST_CITY.lng}`,
          radius: 5000,
          type: 'restaurant',
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        console.log(`✅ API Working! Found ${response.data.results.length} restaurants`);
      } else {
        throw new Error(`API returned status: ${response.data.status}`);
      }
    } catch (error) {
      throw new Error(`❌ API Test Failed: ${error.message}`);
    }

    // Connect to database
    try {
      await sequelize.authenticate();
      console.log('✅ Database connected');
    } catch (error) {
      throw new Error(`❌ Database connection failed: ${error.message}`);
    }

    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized');

    // Get system user
    this.systemUser = await this.getSystemUser();
    console.log(`✅ System user ready (ID: ${this.systemUser.id})`);
    console.log('=' .repeat(60) + '\n');
  }

  async getSystemUser() {
    const [user] = await User.findOrCreate({
      where: { telegram_id: 0 },
      defaults: {
        telegram_id: 0,
        first_name: 'System',
        last_name: 'Admin',
        username: 'system_admin',
        language_code: 'en'
      }
    });
    return user;
  }

  async fetchPlaces(type) {
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    
    try {
      const response = await axios.get(url, {
        params: {
          location: `${TEST_CITY.lat},${TEST_CITY.lng}`,
          radius: TEST_CITY.radius,
          type: 'restaurant',
          keyword: type,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        return response.data.results || [];
      } else if (response.data.status === 'ZERO_RESULTS') {
        return [];
      } else {
        console.warn(`⚠️  API Warning for ${type}: ${response.data.status}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error fetching ${type}:`, error.message);
      return [];
    }
  }

  determineCuisineType(place) {
    const name = place.name.toLowerCase();

    if (name.includes('bukka') || name.includes('amala') || name.includes('jollof') ||
        name.includes('suya') || name.includes('nigerian')) {
      return 'Nigerian';
    }
    if (name.includes('chicken') || name.includes('kfc') || name.includes('domino')) {
      return 'Fast Food';
    }
    if (name.includes('chinese') || name.includes('wok')) {
      return 'Chinese';
    }
    return 'Continental';
  }

  async saveRestaurant(place) {
    try {
      const existing = await Restaurant.findOne({
        where: {
          name: place.name,
          latitude: {
            [sequelize.Sequelize.Op.between]: [
              place.geometry.location.lat - 0.001,
              place.geometry.location.lat + 0.001
            ]
          }
        }
      });

      if (existing) {
        console.log(`  ⏭️  ${place.name} (already exists)`);
        return false;
      }

      const cuisineType = this.determineCuisineType(place);

      const restaurantData = {
        owner_id: this.systemUser.id,
        name: place.name,
        description: `${cuisineType} restaurant in ${TEST_CITY.name}`,
        address: place.vicinity || `${TEST_CITY.name}, ${TEST_CITY.state}`,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        phone: null,
        email: null,
        cuisine_type: cuisineType,
        operating_hours: {},
        delivery_radius: 5.0,
        delivery_fee: Math.floor(Math.random() * 500) + 300,
        minimum_order: Math.floor(Math.random() * 2000) + 1000,
        rating: place.rating || 0,
        total_reviews: place.user_ratings_total || 0,
        is_active: true,
        is_verified: place.rating >= 4.0,
        tags: [TEST_CITY.name, TEST_CITY.state, cuisineType.toLowerCase()],
        features: ['delivery', 'pickup', 'dine-in']
      };

      await Restaurant.create(restaurantData);
      this.totalAdded++;
      
      console.log(`  ✅ ${place.name} - ${cuisineType} - ⭐${place.rating || 'N/A'}`);
      return true;

    } catch (error) {
      console.error(`  ❌ Error saving ${place.name}:`, error.message);
      return false;
    }
  }

  async run() {
    await this.initialize();

    console.log(`📍 Testing with ${TEST_CITY.name}, ${TEST_CITY.state}\n`);

    for (const type of TEST_CUISINES) {
      console.log(`\n🔍 Fetching ${type}...`);
      const places = await this.fetchPlaces(type);
      
      if (places.length === 0) {
        console.log(`  No results for ${type}`);
        continue;
      }

      console.log(`  Found ${places.length} places`);

      // Process first 5 results from each type
      for (const place of places.slice(0, 5)) {
        await this.saveRestaurant(place);
        await this.delay(200); // Respect rate limits
      }

      await this.delay(500);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Successfully added: ${this.totalAdded} restaurants`);
    
    const total = await Restaurant.count();
    console.log(`📊 Total in database: ${total}`);
    
    console.log('\n💡 Next Steps:');
    console.log('   1. If this worked, run: node scripts/populate-restaurants.js');
    console.log('   2. For hotels: node scripts/populate-hotels.js');
    console.log('   3. Test in Telegram: /food Lagos');
    console.log('='.repeat(60) + '\n');
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the test
(async () => {
  const test = new QuickPopulationTest();
  
  try {
    await test.run();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
