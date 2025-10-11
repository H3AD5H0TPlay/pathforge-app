#!/usr/bin/env node
/**
 * Database Reset Script for PathForge
 * 
 * This script provides multiple options for cleaning the database:
 * - Drop all tables and recreate (safe reset)
 * - Delete all user data only
 * - Delete all jobs only  
 * - Complete database file deletion
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import your models
const sequelize = require('../config/database');
const User = require('../models/User');
const Job = require('../models/Job');

class DatabaseCleaner {
  
  static async dropAllTables() {
    console.log('🗑️  Dropping all database tables...');
    try {
      await sequelize.drop();
      console.log('✅ All tables dropped successfully');
      
      console.log('🔄 Recreating database structure...');
      await sequelize.sync({ force: true });
      console.log('✅ Database structure recreated');
      
    } catch (error) {
      console.error('❌ Error dropping tables:', error.message);
      throw error;
    }
  }
  
  static async deleteAllUsers() {
    console.log('👥 Deleting all users...');
    try {
      const deletedUsers = await User.destroy({ 
        where: {},
        truncate: true 
      });
      console.log(`✅ Deleted ${deletedUsers} users`);
    } catch (error) {
      console.error('❌ Error deleting users:', error.message);
      throw error;
    }
  }
  
  static async deleteAllJobs() {
    console.log('💼 Deleting all jobs...');
    try {
      const deletedJobs = await Job.destroy({ 
        where: {},
        truncate: true 
      });
      console.log(`✅ Deleted ${deletedJobs} jobs`);
    } catch (error) {
      console.error('❌ Error deleting jobs:', error.message);
      throw error;
    }
  }
  
  static async deleteAllData() {
    console.log('🧹 Deleting all user data...');
    try {
      await this.deleteAllJobs();
      await this.deleteAllUsers();
      console.log('✅ All user data deleted');
    } catch (error) {
      console.error('❌ Error deleting data:', error.message);
      throw error;
    }
  }
  
  static async deleteDatabaseFile() {
    console.log('💾 Deleting database file...');
    try {
      await sequelize.close();
      
      const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER === 'true';
      const dbPath = isDocker ? '/app/data/pathforge.db' : path.join(__dirname, '..', 'pathforge.db');
      
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log(`✅ Database file deleted: ${dbPath}`);
      } else {
        console.log(`ℹ️  Database file not found: ${dbPath}`);
      }
      
    } catch (error) {
      console.error('❌ Error deleting database file:', error.message);
      throw error;
    }
  }
  
  static async showStats() {
    try {
      const userCount = await User.count();
      const jobCount = await Job.count();
      
      console.log('\n📊 Current Database Stats:');
      console.log(`👥 Users: ${userCount}`);
      console.log(`💼 Jobs: ${jobCount}`);
      console.log(`📈 Total Records: ${userCount + jobCount}`);
      
    } catch (error) {
      console.log('❌ Could not fetch stats (database might not exist)');
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🔧 PathForge Database Cleaner');
  console.log('==============================\n');
  
  try {
    // Test database connection first
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');
    
    // Show current stats
    await DatabaseCleaner.showStats();
    
    switch (command) {
      case 'drop-tables':
        console.log('\n🗑️  DROPPING ALL TABLES AND RECREATING...');
        await DatabaseCleaner.dropAllTables();
        break;
        
      case 'delete-users':
        console.log('\n👥 DELETING ALL USERS...');
        await DatabaseCleaner.deleteAllUsers();
        break;
        
      case 'delete-jobs':
        console.log('\n💼 DELETING ALL JOBS...');
        await DatabaseCleaner.deleteAllJobs();
        break;
        
      case 'delete-all-data':
        console.log('\n🧹 DELETING ALL USER DATA...');
        await DatabaseCleaner.deleteAllData();
        break;
        
      case 'delete-file':
        console.log('\n💾 DELETING DATABASE FILE...');
        await DatabaseCleaner.deleteDatabaseFile();
        return; // Don't show stats after file deletion
        
      default:
        console.log('\nUsage: node reset-database.js [command]');
        console.log('\nCommands:');
        console.log('  drop-tables     - Drop all tables and recreate structure');
        console.log('  delete-users    - Delete all users (keeps structure)');
        console.log('  delete-jobs     - Delete all jobs (keeps structure)');
        console.log('  delete-all-data - Delete all users and jobs');
        console.log('  delete-file     - Delete the entire database file');
        console.log('\nExample: node reset-database.js drop-tables');
        return;
    }
    
    // Show final stats
    console.log('\n📊 Final Database Stats:');
    await DatabaseCleaner.showStats();
    
  } catch (error) {
    console.error('\n❌ Database operation failed:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseCleaner;