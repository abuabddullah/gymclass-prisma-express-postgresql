import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import modules
import { connectDB } from './config/db';
import { errorHandler } from './middleware/error';
import authRoutes from './modules/auth/routes';
import adminRoutes from './modules/admin/routes';
import trainerRoutes from './modules/trainer/routes';
import traineeRoutes from './modules/trainee/routes';
import { ApiError } from './utils/ApiError';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/trainee', traineeRoutes);

app.get('/', (req, res) => {
  const erdPath = path.join(__dirname, '..', 'prisma', 'ERD.svg');
  res.sendFile(erdPath, (err) => {
    if (err) {
      console.error('Error sending ERD.svg:', err);
      res.status(500).send('Failed to load ERD diagram');
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Resource not found',
    errorDetails: [
      {
        field: req.originalUrl,
        message: 'API endpoint not found'
      }
    ]
  });
});



// Error handler middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();