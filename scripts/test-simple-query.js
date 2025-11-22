/**
 * Simple direct test of restaurant queries
 */

const { Restaurant } = require('../src/models');
const { Op } = require('sequelize');

async function simpleTest() {
  try {
    console.log('\n🧪 SIMPLE RESTAURANT QUERY TEST\n');
    console.log('='.repeat(60));

    // Test 1: Get all restaurants count
    const totalCount = await Restaurant.count();
    console.log(`\n📊 Total restaurants in database: ${totalCount}`);

    // Test 2: Get restaurants with Lagos in tags (using CAST)
    console.log(`\n📍 Searching for Lagos restaurants using CAST...\n`);
    
    const sequelize = Restaurant.sequelize;
    const lagosRestaurants = await Restaurant.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          sequelize.where(
            sequelize.cast(sequelize.col('tags'), 'TEXT'),
            { [Op.like]: '%Lagos%' }
          )
        ]
      },
      limit: 5
    });

    if (lagosRestaurants.length > 0) {
      console.log(`✅ Found ${lagosRestaurants.length} restaurants:\n`);
      lagosRestaurants.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name}`);
        console.log(`     Tags: ${JSON.stringify(r.tags)}`);
        console.log(`     Rating: ⭐${r.rating}`);
      });
    } else {
      console.log('❌ No restaurants found');
    }

    // Test 3: Try address search as fallback
    console.log(`\n📍 Trying address-based search as fallback...\n`);
    
    const addressSearch = await Restaurant.findAll({
      where: {
        is_active: true,
        address: { [Op.like]: '%Lagos%' }
      },
      limit: 5
    });

    if (addressSearch.length > 0) {
      console.log(`✅ Found ${addressSearch.length} via address search:\n`);
      addressSearch.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name} - ${r.address}`);
      });
    } else {
      console.log('❌ No restaurants found via address');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.error('SQL:', error.sql);
    process.exit(1);
  }
}

simpleTest();
