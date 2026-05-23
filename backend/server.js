const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/patients', require('./routes/patients'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Hospital Management API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ MongoDB Connected');
    const { seedAdmin } = require('./utils/seed');
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`   API health: http://localhost:${PORT}/`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Start MongoDB locally or set MONGO_URI in backend/.env (e.g. MongoDB Atlas).');
    process.exit(1);
  }
};

startServer();
