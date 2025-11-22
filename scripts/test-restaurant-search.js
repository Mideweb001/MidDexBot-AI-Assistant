/**
 * Test script to verify restaurant state search functionality
 */

const { Restaurant } = require('../src/models');
const { Op } = require('sequelize');

async function testRestaurantSearch() {
  try {
    console.log('\n🧪 TESTING RESTAURANT STATE SEARCH\n');
    console.log('='.repeat(60));

    // Test states
    const testStates = ['Lagos', 'Abuja', 'Rivers', 'Kano', 'Oyo'];

    for (const state of testStates) {
      console.log(`\n📍 Searching for restaurants in: ${state}`);
      console.log('-'.repeat(60));

      const sequelize = Restaurant.sequelize;
      const dialect = sequelize.getDialect();

      let restaurants;
      
      if (dialect === 'postgres') {
        // PostgreSQL query
        restaurants = await Restaurant.findAll({
          where: {
            is_active: true,
            is_verified: true,
            [Op.or]: [
              sequelize.where(
                sequelize.cast(sequelize.col('tags'), 'text'),
                { [Op.like]: `%${state}%` }
              )
            ]
          },
          limit: 5
        });
      } else {
        // SQLite query
        restaurants = await Restaurant.findAll({
          where: {
            is_active: true,
            is_verified: true,
            [Op.or]: [
              sequelize.where(
                sequelize.fn('json_extract', sequelize.col('tags'), '$'),
                { [Op.like]: `%${state}%` }
              )
            ]
          },
          limit: 5
        });
      }

      if (restaurants.length === 0) {
        console.log(`  ❌ No restaurants found`);
      } else {
        console.log(`  ✅ Found ${restaurants.length} restaurant(s):`);
        restaurants.forEach((r, i) => {
          console.log(`     ${i + 1}. ${r.name}`);
          console.log(`        Tags: ${JSON.stringify(r.tags)}`);
          console.log(`        Rating: ⭐${r.rating} (${r.total_reviews} reviews)`);
          console.log(`        Cuisine: ${r.cuisine_type}`);
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
testRestaurantSearch();
