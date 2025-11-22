#!/usr/bin/env node

/**
 * Database Migration Script for Restaurant Features
 * 
 * This script ensures all necessary database tables and columns exist
 * for the new restaurant discovery and ordering features.
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

async function migrateDatabase() {
  console.log('🔄 Starting database migration...\n');

  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL;

  let sequelize;

  if (isProduction && databaseUrl) {
    console.log('📊 Connecting to production database (PostgreSQL)...');
    sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
  } else {
    console.log('📊 Connecting to development database (SQLite)...');
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false
    });
  }

  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Import models
    const models = require('../src/models');
    
    console.log('📋 Checking database schema...\n');

    // Sync models with ALTER (adds missing columns/tables)
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database schema updated successfully!\n');

    // Check specific tables for new features
    const tables = {
      'Restaurant': 'Restaurant table',
      'MenuItem': 'Menu items table',
      'FoodOrder': 'Food orders table',
      'OrderItem': 'Order items table'
    };

    console.log('🔍 Verifying critical tables...\n');

    for (const [modelName, description] of Object.entries(tables)) {
      const model = models[modelName];
      if (model) {
        const count = await model.count();
        console.log(`✅ ${description}: ${count} records`);
      } else {
        console.log(`⚠️  ${description}: Model not found`);
      }
    }

    console.log('\n📊 Database Statistics:\n');

    // Get counts for all relevant tables
    const stats = {
      'Users': models.User,
      'Restaurants': models.Restaurant,
      'Menu Items': models.MenuItem,
      'Food Orders': models.FoodOrder,
      'Hotels': models.Hotel,
      'Businesses': models.Business
    };

    for (const [name, model] of Object.entries(stats)) {
      if (model) {
        const count = await model.count();
        console.log(`   ${name}: ${count}`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Test the bot locally: npm run dev');
    console.log('   2. Test restaurant features:');
    console.log('      - /browse Lagos');
    console.log('      - /nearby (share location)');
    console.log('      - /cart');
    console.log('   3. Deploy to Railway: railway up\n');

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed.');
  }
}

// Run migration
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('\n🎉 All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error.message);
      process.exit(1);
    });
}

module.exports = migrateDatabase;
