const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
    'http://127.0.0.1:5173',
    'http://localhost:4173', // Vite preview
    'http://127.0.0.1:3000'
  ],
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