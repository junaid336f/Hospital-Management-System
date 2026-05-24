const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware — allow local dev + production frontend (set FRONTEND_URL on host, comma-separated)
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];
const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/patients', require('./routes/patients'));

const path = require('path');

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Health check
  app.get('/', (req, res) => {
    res.json({ message: 'Hospital Management API is running' });
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('Attempting to start server...');
    if (!process.env.MONGO_URI) {
      console.error('❌ CRITICAL ERROR: MONGO_URI environment variable is missing!');
    } else {
      console.log('MONGO_URI is provided. Attempting database connection...');
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Connected');
    
    const { seedAdmin } = require('./utils/seed');
    await seedAdmin();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   Allowed CORS origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Please verify your MongoDB Atlas credentials and IP Allowlist.');
    
    // Instead of process.exit(1), start the server anyway so Render logs don't get truncated
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} (BUT DATABASE CONNECTION FAILED)`);
    });
  }
};

startServer();
