import mongoose from 'mongoose';

// MongoDB connection options
const options = {
  // Use new URL parser
  useNewUrlParser: true as any,
  useUnifiedTopology: true as any,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

// Default MongoDB URI (localhost)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agricultural-app';

// Initialize models
let modelsInitialized = false;

// Connection function
export const connectToDatabase = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      // If already connected, return the connection
      return mongoose.connection;
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, options);
    console.log('Connected to MongoDB');

    // Initialize models if not already done
    if (!modelsInitialized) {
      try {
        // Import models to ensure they are registered
        await import('../models/Scheme');
        await import('../models/Crop');
        await import('../models/Tutorial');
        await import('../models/Weather');
        modelsInitialized = true;
      } catch (error) {
        console.error('Error initializing models:', error);
        // Continue even if model initialization fails
      }
    }

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Fall back to mock data if connection fails
    console.log('Using mock data as fallback');
    return null;
  }
};

// Disconnect from MongoDB
export const disconnectFromDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      return;
    }
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}; 