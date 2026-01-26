import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables only in development
// Production (Railway) uses environment variables set in dashboard
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log(`📌 MongoDB URI: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ NOT SET'}`);
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      family: 4, // Use IPv4
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2
    });

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Full Error:', error);
    console.error('⚠️  Retrying connection in 5 seconds...');
    
    // Don't exit immediately - retry after delay
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const retryConn = await mongoose.connect(process.env.MONGODB_URI, {
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 30000,
            family: 4,
            retryWrites: true,
            w: 'majority'
          });
          console.log('✅ MongoDB Connected on retry!');
          resolve(retryConn);
        } catch (retryError) {
          console.error('❌ MongoDB Connection still failing:', retryError.message);
          process.exit(1);
        }
      }, 5000);
    });
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

export default connectDB;
