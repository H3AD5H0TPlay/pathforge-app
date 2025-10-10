const { Sequelize } = require('sequelize');
const path = require('path');

// Create SQLite database - use /app/data in Docker, local path otherwise
const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER === 'true';
const dbPath = isDocker ? '/app/data/pathforge.db' : path.join(__dirname, '..', 'pathforge.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
  },
});

module.exports = sequelize;