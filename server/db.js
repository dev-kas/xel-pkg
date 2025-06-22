import mongoose from 'mongoose';
import logger from './common/logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/xelpkg'
    );
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Add some error handling
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    return conn;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
