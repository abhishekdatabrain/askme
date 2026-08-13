const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/adminAuthRoutes');
const adminRoutes = require('./routes/adminRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Enable CORS for frontend clients (http://localhost:3000, 3001, etc.)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Payload Limit Config (50mb limit to handle base64 profile images and large JSON payloads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AskMe API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/adminauth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/creators', creatorRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
