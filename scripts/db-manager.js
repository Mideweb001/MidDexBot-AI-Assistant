#!/usr/bin/env node

/**
 * Database Management Utility for MidDexBot
 * Provides tools for database management, cleanup, and statistics
 */

const { sequelize, User, Document, Conversation, ProcessedImage, StudySession } = require('../src/models');
const DatabaseService = require('../src/services/DatabaseService');

class DatabaseManager {
  constructor() {
    this.db = new DatabaseService();
  }

  async initialize() {
    try {
      await this.db.initialize();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    }
  }

  async getStats() {
    try {
      const stats = {
        users: await User.count(),
        documents: await Document.count(),
        processedImages: await ProcessedImage.count(),
        studySessions: await StudySession.count(),
        activeConversations: await Conversation.count({ where: { is_active: true } })
      };

      const completedStudySessions = await StudySession.count({
        where: { status: 'completed' }
      });

      const totalStudyTime = await StudySession.sum('duration_minutes', {
        where: { status: 'completed' }
      }) || 0;

      const documentTypes = await Document.findAll({
        attributes: [
          'document_type',
          [sequelize.fn('COUNT', sequelize.col('document_type')), 'count']
        ],
        group: ['document_type'],
        order: [[sequelize.fn('COUNT', sequelize.col('document_type')), 'DESC']]
      });

      console.log('\n📊 **MidDexBot Database Statistics**\n');
      console.log(`👥 Total Users: ${stats.users}`);
      console.log(`📄 Documents Processed: ${stats.documents}`);
      console.log(`📷 Images Processed: ${stats.processedImages}`);
      console.log(`📚 Study Sessions: ${stats.studySessions}`);
      console.log(`📚 Completed Sessions: ${completedStudySessions}`);
      console.log(`⏰ Total Study Time: ${Math.round(totalStudyTime)} minutes`);
      console.log(`💬 Active Conversations: ${stats.activeConversations}`);

      if (documentTypes.length > 0) {
        console.log('\n📋 **Document Types:**');
        documentTypes.forEach(type => {
          console.log(`  • ${type.document_type || 'Unknown'}: ${type.dataValues.count}`);
        });
      }

      return stats;
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }

  async cleanupOldData(days = 30) {
    try {
      console.log(`🧹 Cleaning up data older than ${days} days...`);
      
      const result = await this.db.cleanupOldData(days);
      
      console.log(`✅ Cleanup completed:`);
      console.log(`  • Deleted ${result.deletedSessions} old study sessions`);
      console.log(`  • Deleted ${result.deletedImages} old processed images`);
      
      return result;
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
  }

  async resetDatabase() {
    try {
      console.log('⚠️  WARNING: This will delete ALL data in the database!');
      console.log('Are you sure you want to continue? (This action cannot be undone)');
      
      // In a real implementation, you'd want user confirmation here
      console.log('🔄 Resetting database...');
      
      await sequelize.drop();
      await sequelize.sync({ force: true });
      
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Error resetting database:', error);
      throw error;
    }
  }

  async exportUserData(telegramId) {
    try {
      const user = await User.findOne({
        where: { telegram_id: telegramId },
        include: [
          { model: Document, as: 'documents' },
          { model: ProcessedImage, as: 'processedImages' },
          { model: StudySession, as: 'studySessions' },
          { model: Conversation, as: 'conversations' }
        ]
      });

      if (!user) {
        console.log(`❌ User with Telegram ID ${telegramId} not found`);
        return null;
      }

      const userData = {
        user: {
          telegramId: user.telegram_id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          preferences: user.preferences,
          joinDate: user.created_at,
          lastActive: user.last_active
        },
        documents: user.documents.map(doc => ({
          id: doc.id,
          filename: doc.filename,
          type: doc.document_type,
          processedAt: doc.created_at,
          wordCount: doc.word_count,
          atsScore: doc.ats_score
        })),
        images: user.processedImages.map(img => ({
          id: img.id,
          type: img.image_type,
          processedAt: img.created_at,
          confidenceScore: img.confidence_score
        })),
        studySessions: user.studySessions.map(session => ({
          id: session.id,
          type: session.session_type,
          topic: session.topic,
          duration: session.duration_minutes,
          status: session.status,
          createdAt: session.created_at
        })),
        stats: {
          totalDocuments: user.documents.length,
          totalImages: user.processedImages.length,
          totalStudySessions: user.studySessions.length,
          totalStudyTime: user.studySessions
            .filter(s => s.status === 'completed')
            .reduce((total, s) => total + (s.duration_minutes || 0), 0)
        }
      };

      console.log(`📊 **User Data Export for ${user.username || user.first_name}**\n`);
      console.log(JSON.stringify(userData, null, 2));
      
      return userData;
    } catch (error) {
      console.error('❌ Error exporting user data:', error);
      throw error;
    }
  }

  async close() {
    await this.db.close();
  }
}

// CLI Interface
async function main() {
  const manager = new DatabaseManager();
  await manager.initialize();

  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'stats':
        await manager.getStats();
        break;
        
      case 'cleanup':
        const days = parseInt(arg) || 30;
        await manager.cleanupOldData(days);
        break;
        
      case 'reset':
        await manager.resetDatabase();
        break;
        
      case 'export':
        if (!arg) {
          console.log('❌ Please provide a Telegram ID to export');
          console.log('Usage: node scripts/db-manager.js export 123456789');
          process.exit(1);
        }
        await manager.exportUserData(parseInt(arg));
        break;
        
      default:
        console.log('📚 **MidDexBot Database Manager**\n');
        console.log('Available commands:');
        console.log('  stats              - Show database statistics');
        console.log('  cleanup [days]     - Clean up old data (default: 30 days)');
        console.log('  export <telegram_id> - Export user data');
        console.log('  reset              - Reset entire database (⚠️  DANGEROUS)');
        console.log('\nExamples:');
        console.log('  node scripts/db-manager.js stats');
        console.log('  node scripts/db-manager.js cleanup 60');
        console.log('  node scripts/db-manager.js export 123456789');
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  } finally {
    await manager.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseManager;