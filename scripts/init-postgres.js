#!/usr/bin/env node

const { Sequelize } = require('sequelize');

async function initializePostgreSQL() {
  if (!process.env.DATABASE_URL) {
    console.log('🟡 DATABASE_URL not found, skipping PostgreSQL initialization');
    return;
  }

  console.log('🚀 Initializing PostgreSQL database...');
  
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });

  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established');

    // Import all models to get their definitions
    const { 
      User, Document, Conversation, ProcessedImage, StudySession,
      CryptoAlert, UserCryptoWatchlist, CryptoInventory,
      StudyGroup, StudyGroupMember, HomeworkSession,
      Event, Course, UserCourse,
      Restaurant, MenuItem, FoodOrder, OrderItem
    } = require('../src/models');

    // Create tables in the correct order (dependencies first)
    console.log('📋 Creating tables in dependency order...');
    
    // Base tables (no dependencies)
    await User.sync({ force: false });
    console.log('✅ Users table created');
    
    await Course.sync({ force: false });
    console.log('✅ Courses table created');
    
    await Restaurant.sync({ force: false });
    console.log('✅ Restaurants table created');
    
    await StudyGroup.sync({ force: false });
    console.log('✅ Study groups table created');

    // Tables with single dependencies
    await Document.sync({ force: false });
    console.log('✅ Documents table created');
    
    await Conversation.sync({ force: false });
    console.log('✅ Conversations table created');
    
    await ProcessedImage.sync({ force: false });
    console.log('✅ Processed images table created');
    
    await StudySession.sync({ force: false });
    console.log('✅ Study sessions table created');
    
    await CryptoAlert.sync({ force: false });
    console.log('✅ Crypto alerts table created');
    
    await UserCryptoWatchlist.sync({ force: false });
    console.log('✅ Crypto watchlist table created');
    
    await CryptoInventory.sync({ force: false });
    console.log('✅ Crypto inventory table created');
    
    await MenuItem.sync({ force: false });
    console.log('✅ Menu items table created');
    
    await StudyGroupMember.sync({ force: false });
    console.log('✅ Study group members table created');
    
    await HomeworkSession.sync({ force: false });
    console.log('✅ Homework sessions table created');
    
    await Event.sync({ force: false });
    console.log('✅ Events table created');
    
    await UserCourse.sync({ force: false });
    console.log('✅ User courses table created');
    
    await FoodOrder.sync({ force: false });
    console.log('✅ Food orders table created');
    
    // Tables with multiple dependencies (last)
    await OrderItem.sync({ force: false });
    console.log('✅ Order items table created');

    console.log('🎉 PostgreSQL database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  initializePostgreSQL().then(() => {
    console.log('✅ Database initialization complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });
}

module.exports = initializePostgreSQL;