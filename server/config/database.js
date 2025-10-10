const { Sequelize } = require('sequelize');
const path = require('path');

// Create SQLite database in the server directory
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'pathforge.db'),
  logging: console.log, // Set to false to disable SQL query logging
  define: {
    timestamps: true,
    underscored: false,
  },
});

module.exports = sequelize;