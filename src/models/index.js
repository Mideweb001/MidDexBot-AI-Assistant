const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize database (PostgreSQL in production, SQLite in development)
let sequelize;
if (process.env.DATABASE_URL) {
  // Production: Use PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    define: {
      timestamps: true,
      underscored: true,
    }
  });
} else {
  // Development: Use SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    }
  });
}

// Import models
const User = require('./User')(sequelize);
const Document = require('./Document')(sequelize);
const Conversation = require('./Conversation')(sequelize);
const ProcessedImage = require('./ProcessedImage')(sequelize);
const StudySession = require('./StudySession')(sequelize);
const CryptoAlert = require('./CryptoAlert')(sequelize);
const UserCryptoWatchlist = require('./UserCryptoWatchlist')(sequelize);
const CryptoInventory = require('./CryptoInventory')(sequelize);
const StudyGroup = require('./StudyGroup')(sequelize);
const StudyGroupMember = require('./StudyGroupMember')(sequelize);
const HomeworkSession = require('./HomeworkSession')(sequelize);
const Event = require('./Event')(sequelize);
const Course = require('./Course')(sequelize);
const UserCourse = require('./UserCourse')(sequelize);

// Food ordering models
const Restaurant = require('./Restaurant')(sequelize);
const MenuItem = require('./MenuItem')(sequelize);
const FoodOrder = require('./FoodOrder')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);

// Define associations
User.hasMany(Document, { foreignKey: 'user_id', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Conversation, { foreignKey: 'user_id', as: 'conversations' });
Conversation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(ProcessedImage, { foreignKey: 'user_id', as: 'processedImages' });
ProcessedImage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(StudySession, { foreignKey: 'user_id', as: 'studySessions' });
StudySession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(CryptoAlert, { foreignKey: 'user_id', as: 'cryptoAlerts' });
CryptoAlert.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(UserCryptoWatchlist, { foreignKey: 'user_id', as: 'cryptoWatchlist' });
UserCryptoWatchlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(CryptoInventory, { foreignKey: 'user_id', as: 'cryptoInventory' });
CryptoInventory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Study Group associations
User.hasMany(StudyGroup, { foreignKey: 'creator_id', as: 'createdStudyGroups' });
StudyGroup.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });

StudyGroup.hasMany(StudyGroupMember, { foreignKey: 'study_group_id', as: 'members' });
StudyGroupMember.belongsTo(StudyGroup, { foreignKey: 'study_group_id', as: 'studyGroup' });

User.hasMany(StudyGroupMember, { foreignKey: 'user_id', as: 'studyGroupMemberships' });
StudyGroupMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Many-to-many through StudyGroupMember
User.belongsToMany(StudyGroup, { 
  through: StudyGroupMember, 
  foreignKey: 'user_id',
  otherKey: 'study_group_id',
  as: 'joinedStudyGroups'
});
StudyGroup.belongsToMany(User, { 
  through: StudyGroupMember, 
  foreignKey: 'study_group_id',
  otherKey: 'user_id',
  as: 'groupMembers'
});

// Homework associations
User.hasMany(HomeworkSession, { foreignKey: 'user_id', as: 'homeworkSessions' });
HomeworkSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

StudyGroup.hasMany(HomeworkSession, { foreignKey: 'study_group_id', as: 'sharedHomework' });
HomeworkSession.belongsTo(StudyGroup, { foreignKey: 'study_group_id', as: 'studyGroup' });

// Event associations
User.hasMany(Event, { foreignKey: 'user_id', as: 'events' });
Event.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

StudyGroup.hasMany(Event, { foreignKey: 'study_group_id', as: 'groupEvents' });
Event.belongsTo(StudyGroup, { foreignKey: 'study_group_id', as: 'studyGroup' });

// Self-referencing for recurring events
Event.hasMany(Event, { foreignKey: 'parent_event_id', as: 'childEvents' });
Event.belongsTo(Event, { foreignKey: 'parent_event_id', as: 'parentEvent' });

// Course associations
Course.hasMany(UserCourse, { foreignKey: 'course_id', as: 'enrollments' });
UserCourse.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(UserCourse, { foreignKey: 'user_id', as: 'courseEnrollments' });
UserCourse.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Many-to-many through UserCourse
User.belongsToMany(Course, { 
  through: UserCourse, 
  foreignKey: 'user_id',
  otherKey: 'course_id',
  as: 'enrolledCourses'
});
Course.belongsToMany(User, { 
  through: UserCourse, 
  foreignKey: 'course_id',
  otherKey: 'user_id',
  as: 'enrolledUsers'
});

// Restaurant associations
User.hasMany(Restaurant, { foreignKey: 'owner_id', as: 'ownedRestaurants' });
Restaurant.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Restaurant.hasMany(MenuItem, { foreignKey: 'restaurant_id', as: 'menuItems' });
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

// Food Order associations
User.hasMany(FoodOrder, { foreignKey: 'customer_id', as: 'foodOrders' });
FoodOrder.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

Restaurant.hasMany(FoodOrder, { foreignKey: 'restaurant_id', as: 'orders' });
FoodOrder.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

FoodOrder.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(FoodOrder, { foreignKey: 'order_id', as: 'order' });

MenuItem.hasMany(OrderItem, { foreignKey: 'menu_item_id', as: 'orderItems' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'menuItem' });

module.exports = {
  sequelize,
  User,
  Document,
  Conversation,
  ProcessedImage,
  StudySession,
  CryptoAlert,
  UserCryptoWatchlist,
  CryptoInventory,
  StudyGroup,
  StudyGroupMember,
  HomeworkSession,
  Event,
  Course,
  UserCourse,
  Restaurant,
  MenuItem,
  FoodOrder,
  OrderItem
};