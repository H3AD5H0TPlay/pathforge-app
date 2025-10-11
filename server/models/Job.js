const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Job title is required' },
      len: {
        args: [3, 100],
        msg: 'Job title must be between 3 and 100 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: 'Job description cannot exceed 2000 characters'
      }
    }
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Company name is required' },
      len: {
        args: [1, 100],
        msg: 'Company name cannot exceed 100 characters'
      }
    }
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Job location is required' },
      len: {
        args: [1, 100],
        msg: 'Location cannot exceed 100 characters'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('applied', 'interview', 'offer', 'rejected'),
    defaultValue: 'applied',
    validate: {
      isIn: {
        args: [['applied', 'interview', 'offer', 'rejected']],
        msg: 'Status must be one of: applied, interview, offer, rejected'
      }
    }
  },
  salary: {
    type: DataTypes.STRING,
    allowNull: true
  },
  appliedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'jobs',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Job;