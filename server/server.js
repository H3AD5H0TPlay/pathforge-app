const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import database and models
const sequelize = require('./config/database');
const User = require('./models/User');
const Job = require('./models/Job');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection and sync
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Database Connected Successfully!');
    
    // Define model associations
    Job.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasMany(Job, { foreignKey: 'userId', as: 'jobs' });
    
    // Sync all models (force: true to recreate tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized successfully!');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// CORS configuration
const getAllowedOrigins = () => {
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
    'http://127.0.0.1:5173',
    'http://localhost:4173', // Vite preview
    'http://127.0.0.1:3000',
    'http://localhost', // Docker frontend (port 80)
    'http://localhost:80', // Docker frontend explicit port
    'http://127.0.0.1', // Docker frontend
    'http://127.0.0.1:80' // Docker frontend explicit port
  ];

  // Add production origins from environment variable
  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  if (allowedOrigins) {
    const productionOrigins = allowedOrigins.split(',').map(origin => origin.trim());
    return [...defaultOrigins, ...productionOrigins];
  }

  return defaultOrigins;
};

const corsOptions = {
  origin: getAllowedOrigins(),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    cors(corsOptions)(req, res, next);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for testing
app.use('/test', express.static(__dirname));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'PathForge API Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// API fallback route - catch unmatched /api routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `API route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;