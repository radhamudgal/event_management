import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  mongoose.set('strictQuery', true);

  // Try standard connection first
  try {
    console.log('Connecting to MongoDB...');
    // We set a short serverSelectionTimeoutMS so that if local MongoDB is not running,
    // it fails quickly and starts the in-memory fallback.
    await mongoose.connect(uri || 'mongodb://localhost:27017/event-portal', {
      serverSelectionTimeoutMS: 2500
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.warn('Standard MongoDB connection failed. Bootstrapping in-memory MongoDB Server...', err.message);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      console.log(`In-Memory MongoDB Server running at: ${inMemoryUri}`);
      
      await mongoose.connect(inMemoryUri);
      console.log('MongoDB connected successfully (In-Memory Database)');
    } catch (fallbackErr) {
      console.error('Failed to start in-memory MongoDB fallback server:', fallbackErr);
      throw err; // throw original connection error if fallback also failed
    }
  }
}
